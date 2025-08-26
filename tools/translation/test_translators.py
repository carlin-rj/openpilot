#!/usr/bin/env python3
"""
翻译器测试脚本
用于测试各种翻译器是否正常工作

使用方法:
python test_translators.py
"""

import asyncio
import json
import os
import sys
import pathlib
import time

# 添加当前目录到Python路径
sys.path.insert(0, str(pathlib.Path(__file__).parent))

from tools.translation.multi_translator import (
    OpenAITranslator, DeepLTranslator, BaiduTranslator, 
    GoogleTranslator, DictionaryTranslator, MultiTranslator
)

class TranslatorTester:
    def __init__(self):
        self.test_texts = [
            "Hello, how are you?",
            "Settings",
            "Close",
            "Loading...",
            "Device",
            "Temperature",
            "EXPERIMENTAL MODE ON"
        ]
        
        self.target_language = "zh-CHS"
        
    async def test_translator(self, translator, name: str):
        """测试单个翻译器"""
        print(f"\n🧪 测试翻译器: {name}")
        print("-" * 50)
        
        if not translator.is_available():
            print(f"❌ {name} 不可用 (缺少API密钥或配置)")
            return False
            
        success_count = 0
        total_count = len(self.test_texts)
        
        for text in self.test_texts:
            try:
                start_time = time.time()
                result = await translator.translate(text, self.target_language)
                end_time = time.time()
                
                if result:
                    print(f"✅ '{text}' -> '{result}' ({end_time - start_time:.2f}s)")
                    success_count += 1
                else:
                    print(f"❌ '{text}' -> 翻译失败")
                    
                # 等待速率限制
                await translator.rate_limit_wait()
                
            except Exception as e:
                print(f"❌ '{text}' -> 错误: {e}")
        
        success_rate = (success_count / total_count) * 100
        print(f"\n📊 {name} 成功率: {success_count}/{total_count} ({success_rate:.1f}%)")
        
        return success_rate > 50  # 超过50%成功率视为可用
    
    async def test_all_translators(self):
        """测试所有翻译器"""
        print("🌐 OpenPilot 翻译器测试")
        print("=" * 60)
        
        translators = {
            "字典翻译": DictionaryTranslator(),
            "DeepL": DeepLTranslator(), 
            "谷歌翻译": GoogleTranslator(),
            "百度翻译": BaiduTranslator(),
            "OpenAI": OpenAITranslator(),
        }
        
        available_translators = []
        
        for name, translator in translators.items():
            success = await self.test_translator(translator, name)
            if success:
                available_translators.append(name)
        
        print("\n" + "=" * 60)
        print("📋 测试结果汇总:")
        print(f"✅ 可用翻译器: {', '.join(available_translators) if available_translators else '无'}")
        
        # 测试多翻译器管理器
        print("\n🔄 测试多翻译器管理器...")
        multi_translator = MultiTranslator()
        
        test_text = "Hello World"
        result = await multi_translator.translate_text(test_text, self.target_language, "auto")
        
        if result:
            print(f"✅ 自动翻译: '{test_text}' -> '{result}'")
        else:
            print(f"❌ 自动翻译失败")
        
        return available_translators
    
    def check_environment(self):
        """检查环境配置"""
        print("🔧 检查环境配置")
        print("-" * 30)
        
        env_checks = {
            "OpenAI API密钥": os.environ.get("OPENAI_API_KEY"),
            "OpenAI模型": os.environ.get("OPENAI_MODEL", "gpt-4"),
            "DeepL API地址": os.environ.get("DEEPL_API_URL", "https://deepl.borber.top"),
            "百度APP ID": os.environ.get("BAIDU_APP_ID"),
            "百度密钥": os.environ.get("BAIDU_SECRET_KEY"),
        }
        
        for name, value in env_checks.items():
            if value:
                # 隐藏敏感信息
                if "密钥" in name or "KEY" in name:
                    display_value = f"{value[:8]}..." if len(value) > 8 else "****"
                else:
                    display_value = value
                print(f"✅ {name}: {display_value}")
            else:
                print(f"❌ {name}: 未设置")
        
        print()

async def test_deepl_server():
    """专门测试您提供的DeepL服务"""
    print("🧪 测试 DeepL 翻译服务器")
    print("-" * 40)
    
    base_url = "https://deepl.borber.top"
    
    try:
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            async with session.post(
                f"{base_url}/translate",
                json={
                    "text": "Hello, how are you?",
                    "target": "zh-CN",
                },
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                end_time = time.time()
                
                print(f"⏱️  请求耗时: {(end_time - start_time) * 1000:.0f} 毫秒")
                print(f"📡 状态码: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print(f"📝 响应: {json.dumps(result, ensure_ascii=False, indent=2)}")
                    return True
                else:
                    print(f"❌ 请求失败: {response.status}")
                    return False
                    
    except Exception as e:
        print(f"❌ 连接错误: {e}")
        return False

async def main():
    """主函数"""
    print("🚀 OpenPilot 翻译系统测试")
    print("=" * 60)
    
    tester = TranslatorTester()
    
    # 检查环境配置
    tester.check_environment()
    
    # 测试DeepL服务器
    deepl_available = await test_deepl_server()
    
    # 测试所有翻译器
    available_translators = await tester.test_all_translators()
    
    # 给出建议
    print("\n" + "=" * 60)
    print("💡 建议:")
    
    if "字典翻译" in available_translators:
        print("✅ 字典翻译可用，适合常见术语的快速翻译")
    
    if deepl_available and "DeepL" in available_translators:
        print("✅ DeepL 翻译可用，推荐用于高质量翻译")
    
    if "OpenAI" in available_translators:
        print("✅ OpenAI 翻译可用，质量高但速度较慢")
    
    if not available_translators:
        print("❌ 没有可用的翻译器，请检查网络连接和API配置")
        print("💡 至少字典翻译应该可用，请检查代码是否有问题")
    
    print("\n🔧 环境配置命令示例:")
    print("export OPENAI_API_KEY='your-openai-key'")
    print("export BAIDU_APP_ID='your-baidu-app-id'")  
    print("export BAIDU_SECRET_KEY='your-baidu-secret-key'")
    print("export DEEPL_API_URL='https://deepl.borber.top'")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ 测试被用户中断")
    except Exception as e:
        print(f"\n❌ 测试过程中出错: {e}")