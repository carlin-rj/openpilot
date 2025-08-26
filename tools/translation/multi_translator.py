#!/usr/bin/env python3
"""
OpenPilot 多翻译器管理系统
支持多种翻译引擎：OpenAI、DeepL、百度翻译、谷歌翻译等

使用方法:
1. 使用OpenAI翻译: python multi_translator.py --auto-translate --language zh-CHS --translator openai
2. 使用DeepL翻译: python multi_translator.py --auto-translate --language zh-CHS --translator deepl
3. 使用百度翻译: python multi_translator.py --auto-translate --language zh-CHS --translator baidu
4. 自动选择翻译器: python multi_translator.py --auto-translate --language zh-CHS --translator auto
"""

import argparse
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Set, Tuple
import asyncio
import aiohttp

# 项目路径配置
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
UI_DIR = PROJECT_ROOT / "selfdrive" / "ui"
TRANSLATIONS_DIR = UI_DIR / "translations"
LANGUAGES_FILE = TRANSLATIONS_DIR / "languages.json"

# 语言代码映射表
LANGUAGE_CODE_MAP = {
    # OpenPilot语言代码 -> 各翻译服务的语言代码
    "zh-CHS": {
        "openai": "Chinese (Simplified)",
        "deepl": "zh-CN",
        "baidu": "zh",
        "google": "zh-cn",
        "youdao": "zh-CHS"
    },
    "zh-CHT": {
        "openai": "Chinese (Traditional)",
        "deepl": "zh-TW",
        "baidu": "cht",
        "google": "zh-tw",
        "youdao": "zh-CHT"
    },
    "ja": {
        "openai": "Japanese",
        "deepl": "ja",
        "baidu": "jp",
        "google": "ja",
        "youdao": "ja"
    },
    "ko": {
        "openai": "Korean",
        "deepl": "ko",
        "baidu": "kor",
        "google": "ko",
        "youdao": "ko"
    },
    "fr": {
        "openai": "French",
        "deepl": "fr",
        "baidu": "fra",
        "google": "fr",
        "youdao": "fr"
    },
    "de": {
        "openai": "German",
        "deepl": "de",
        "baidu": "de",
        "google": "de",
        "youdao": "de"
    },
    "es": {
        "openai": "Spanish",
        "deepl": "es",
        "baidu": "spa",
        "google": "es",
        "youdao": "es"
    },
    "pt-BR": {
        "openai": "Portuguese (Brazil)",
        "deepl": "pt-BR",
        "baidu": "pt",
        "google": "pt",
        "youdao": "pt"
    }
}

class BaseTranslator(ABC):
    """翻译器基类"""

    def __init__(self, name: str):
        self.name = name
        self._rate_limit_delay = 0.1  # 默认请求间隔

    @abstractmethod
    async def translate(self, text: str, target_language: str, source_language: str = "en") -> Optional[str]:
        """翻译文本"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """检查翻译器是否可用"""
        pass

    def get_language_code(self, openpilot_lang: str) -> Optional[str]:
        """获取翻译服务对应的语言代码"""
        return LANGUAGE_CODE_MAP.get(openpilot_lang, {}).get(self.name)

    async def rate_limit_wait(self):
        """速率限制等待"""
        await asyncio.sleep(self._rate_limit_delay)

class OpenAITranslator(BaseTranslator):
    """OpenAI GPT翻译器"""

    def __init__(self):
        super().__init__("openai")
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.model = os.environ.get("OPENAI_MODEL", "gpt-4")
        self._rate_limit_delay = 1.0  # OpenAI需要更长的等待时间

    def is_available(self) -> bool:
        return bool(self.api_key)

    async def translate(self, text: str, target_language: str, source_language: str = "en") -> Optional[str]:
        if not self.is_available():
            return None

        target_lang_name = self.get_language_code(target_language)
        if not target_lang_name:
            target_lang_name = target_language

        prompt = f"You are a professional translator from English to {target_lang_name}. " + \
                f"The following sentence or word is in the GUI of a software called openpilot, " + \
                f"translate it accordingly. Only return the translation, no explanations."

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": prompt},
                            {"role": "user", "content": text}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 200
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["choices"][0]["message"]["content"].strip()
                    else:
                        print(f"OpenAI API error: {response.status}")
                        return None

        except Exception as e:
            print(f"OpenAI translation error: {e}")
            return None

class DeepLTranslator(BaseTranslator):
    """DeepL翻译器 (使用您提供的API服务)"""

    def __init__(self):
        super().__init__("deepl")
        self.base_url = os.environ.get("DEEPL_API_URL", "https://deepl.borber.top")
        self._rate_limit_delay = 0.5

    def is_available(self) -> bool:
        return True  # 公开API，默认可用

    async def translate(self, text: str, target_language: str, source_language: str = "en") -> Optional[str]:
        target_code = self.get_language_code(target_language)
        if not target_code:
            target_code = target_language

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/translate",
                    json={
                        "text": text,
                        "target": target_code,
                        "source": "auto"  # 自动检测源语言
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        # 根据API响应格式调整
                        if "data" in data and "translatedText" in data["data"]:
                            return data["data"]["translatedText"]
                        elif "translations" in data and data["translations"]:
                            return data["translations"][0]["text"]
                        elif "result" in data:
                            return data["result"]
                        else:
                            return str(data)  # 兜底：直接返回原始数据
                    else:
                        print(f"DeepL API error: {response.status}")
                        return None

        except Exception as e:
            print(f"DeepL translation error: {e}")
            return None

class BaiduTranslator(BaseTranslator):
    """百度翻译器"""

    def __init__(self):
        super().__init__("baidu")
        self.app_id = os.environ.get("BAIDU_APP_ID")
        self.secret_key = os.environ.get("BAIDU_SECRET_KEY")
        self._rate_limit_delay = 0.2

    def is_available(self) -> bool:
        return bool(self.app_id and self.secret_key)

    async def translate(self, text: str, target_language: str, source_language: str = "en") -> Optional[str]:
        if not self.is_available():
            return None

        target_code = self.get_language_code(target_language) or "zh"

        try:
            import hashlib
            import random

            # 百度翻译API签名算法
            salt = str(random.randint(32768, 65536))
            sign_str = f"{self.app_id}{text}{salt}{self.secret_key}"
            sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest()

            params = {
                "q": text,
                "from": "en",
                "to": target_code,
                "appid": self.app_id,
                "salt": salt,
                "sign": sign
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://fanyi-api.baidu.com/api/trans/vip/translate",
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if "trans_result" in data and data["trans_result"]:
                            return data["trans_result"][0]["dst"]
                    return None

        except Exception as e:
            print(f"Baidu translation error: {e}")
            return None

class GoogleTranslator(BaseTranslator):
    """谷歌翻译器 (使用免费API)"""

    def __init__(self):
        super().__init__("google")
        self._rate_limit_delay = 0.3

    def is_available(self) -> bool:
        return True  # 使用免费API

    async def translate(self, text: str, target_language: str, source_language: str = "en") -> Optional[str]:
        target_code = self.get_language_code(target_language) or target_language

        try:
            # 使用公开的谷歌翻译API
            url = "https://translate.googleapis.com/translate_a/single"
            params = {
                "client": "gtx",
                "sl": "en",
                "tl": target_code,
                "dt": "t",
                "q": text
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    url,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data and data[0] and data[0][0]:
                            return data[0][0][0]
                    return None

        except Exception as e:
            print(f"Google translation error: {e}")
            return None

class MultiTranslator:
    """多翻译器管理器"""

    def __init__(self):
        self.translators = {
            "openai": OpenAITranslator(),
            "deepl": DeepLTranslator(),
            "baidu": BaiduTranslator(),
            "google": GoogleTranslator(),
        }

        # 翻译器优先级（按质量排序）
        self.priority_order = ["deepl", "openai", "baidu", "google"]

    def get_available_translators(self) -> List[str]:
        """获取可用的翻译器列表"""
        return [name for name, translator in self.translators.items() if translator.is_available()]

    async def translate_text(self, text: str, target_language: str,
                           translator_name: str = "auto") -> Optional[str]:
        """翻译文本"""
        if translator_name == "auto":
            # 按优先级尝试翻译器
            for name in self.priority_order:
                if name in self.translators and self.translators[name].is_available():
                    result = await self.translators[name].translate(text, target_language)
                    if result:
                        return result
                    await self.translators[name].rate_limit_wait()
            return None
        else:
            # 使用指定翻译器
            if translator_name in self.translators:
                translator = self.translators[translator_name]
                if translator.is_available():
                    result = await translator.translate(text, target_language)
                    await translator.rate_limit_wait()
                    return result
            return None

class EnhancedTranslationManager:
    """增强版翻译管理器"""

    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.ui_dir = UI_DIR
        self.translations_dir = TRANSLATIONS_DIR
        self.languages_file = LANGUAGES_FILE
        self.multi_translator = MultiTranslator()

    def get_language_files(self) -> Dict[str, pathlib.Path]:
        """获取所有语言文件"""
        files = {}

        if not self.languages_file.exists():
            print(f"Languages file not found: {self.languages_file}")
            return files

        try:
            with open(self.languages_file) as fp:
                language_dict = json.load(fp)

            for filename in language_dict.values():
                path = self.translations_dir / f"{filename}.ts"
                if path.exists():
                    language = path.stem.split("main_")[1]
                    files[language] = path

        except Exception as e:
            print(f"Error reading languages file: {e}")

        return files

    def update_source_translations(self) -> None:
        """使用lupdate更新源翻译文件"""
        print("🔄 正在使用 lupdate 更新源翻译...")

        try:
            cmd = ["lupdate", "-recursive", str(self.ui_dir), "-ts"]

            language_files = self.get_language_files()
            for ts_file in language_files.values():
                cmd.append(str(ts_file))

            if not language_files:
                print("❌ 未找到语言文件!")
                return

            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                print("✅ 源翻译更新成功")
            else:
                print(f"❌ lupdate 失败: {result.stderr}")

        except FileNotFoundError:
            print("❌ 未找到 lupdate 命令。请安装 Qt 开发工具。")
        except Exception as e:
            print(f"❌ 运行 lupdate 时出错: {e}")

    async def auto_translate_file(self, ts_file: pathlib.Path, language: str,
                                 translator_name: str = "auto",
                                 only_unfinished: bool = True) -> None:
        """自动翻译TS文件"""
        print(f"🌐 正在翻译 {language} ({ts_file.name}) 使用翻译器: {translator_name}")

        # 检查翻译器可用性
        available_translators = self.multi_translator.get_available_translators()
        print(f"📋 可用翻译器: {', '.join(available_translators)}")

        if translator_name != "auto" and translator_name not in available_translators:
            print(f"❌ 翻译器 '{translator_name}' 不可用")
            return

        try:
            tree = ET.parse(ts_file)
            root = tree.getroot()

            translated_count = 0
            total_count = 0
            removed_count = 0
            contexts_to_remove = []

            for context in root.findall("./context"):
                context_name = context.find("name")
                if context_name is None:
                    continue

                print(f"📂 处理上下文: {context_name.text}")

                messages_to_remove = []

                for message in context.findall("./message"):
                    source = message.find("source")
                    translation = message.find("translation")

                    if source is None or translation is None:
                        continue

                    # 检查是否为 vanished 类型，直接移除
                    if translation.attrib.get("type") == "vanished":
                        print(f"  🗑️ 移除已废弃条目: '{source.text}'")
                        messages_to_remove.append(message)
                        removed_count += 1
                        continue

                    # 跳过已翻译的条目（如果只翻译未完成的）
                    if only_unfinished and translation.attrib.get("type") != "unfinished":
                        continue

                    # 跳过空字符串
                    if not source.text or not source.text.strip():
                        continue

                    total_count += 1

                    try:
                        result = await self.multi_translator.translate_text(
                            source.text, language, translator_name
                        )

                        if result:
                            print(f"  ✅ '{source.text}' -> '{result}'")
                            translation.text = result
                            if "type" in translation.attrib:
                                del translation.attrib["type"]
                            translated_count += 1
                        else:
                            print(f"  ❌ 翻译失败: '{source.text}'")

                    except Exception as e:
                        print(f"  ❌ 翻译错误 '{source.text}': {e}")

                # 移除标记为删除的message
                for message in messages_to_remove:
                    context.remove(message)

                # 检查context是否还有message子节点，如果没有则标记为删除
                remaining_messages = context.findall("./message")
                if not remaining_messages:
                    print(f"  🗑️ 移除空上下文: {context_name.text}")
                    contexts_to_remove.append(context)

            # 移除空的context节点
            for context in contexts_to_remove:
                root.remove(context)

            # 保存文件
            self._save_ts_file(tree, ts_file)
            print(f"✅ 翻译完成! 成功翻译 {translated_count}/{total_count} 条，移除 {removed_count} 个废弃条目")

        except Exception as e:
            print(f"❌ 处理文件时出错 {ts_file}: {e}")

    def _save_ts_file(self, tree: ET.ElementTree, file_path: pathlib.Path) -> None:
        """保存TS文件"""
        root = tree.getroot()

        with open(file_path, 'w', encoding='utf-8') as fp:
            fp.write('<?xml version="1.0" encoding="utf-8"?>\n')
            fp.write('<!DOCTYPE TS>\n')
            fp.write(ET.tostring(root, encoding='unicode'))

    def compile_translations(self) -> None:
        """编译TS文件为QM文件"""
        print("🔨 正在编译翻译文件...")

        language_files = self.get_language_files()

        for language, ts_file in language_files.items():
            qm_file = ts_file.with_suffix('.qm')

            try:
                cmd = ["lrelease", str(ts_file), "-qm", str(qm_file)]
                result = subprocess.run(cmd, capture_output=True, text=True)

                if result.returncode == 0:
                    print(f"✅ 编译成功 {language}: {qm_file.name}")
                else:
                    print(f"❌ 编译失败 {language}: {result.stderr}")

            except FileNotFoundError:
                print("❌ 未找到 lrelease 命令。请安装 Qt 开发工具。")
                break
            except Exception as e:
                print(f"❌ 编译错误 {ts_file}: {e}")

    def show_translation_status(self) -> None:
        """显示翻译状态"""
        print("📊 翻译状态报告")
        print("=" * 70)

        language_files = self.get_language_files()

        for language, ts_file in language_files.items():
            try:
                tree = ET.parse(ts_file)
                root = tree.getroot()

                total = 0
                translated = 0
                unfinished = 0

                for message in root.findall(".//message"):
                    total += 1
                    translation = message.find("translation")

                    if translation is not None:
                        if translation.attrib.get("type") == "unfinished":
                            unfinished += 1
                        else:
                            translated += 1

                completion = (translated / total * 100) if total > 0 else 0

                status_emoji = "🟢" if completion >= 90 else "🟡" if completion >= 70 else "🔴"
                print(f"{status_emoji} {language:10} | {translated:4}/{total:4} ({completion:5.1f}%) | "
                      f"未完成: {unfinished:4}")

            except Exception as e:
                print(f"❌ {language:10} | 读取文件错误: {e}")

        print("=" * 70)

        # 显示可用翻译器
        available_translators = self.multi_translator.get_available_translators()
        print(f"🔧 可用翻译器: {', '.join(available_translators)}")

async def main():
    parser = argparse.ArgumentParser(
        description="OpenPilot 多翻译器管理系统",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
🌐 支持的翻译器:
  • openai    - OpenAI GPT (需要 OPENAI_API_KEY)
  • deepl     - DeepL 翻译 (使用公开API)
  • baidu     - 百度翻译 (需要 BAIDU_APP_ID 和 BAIDU_SECRET_KEY)
  • google    - 谷歌翻译 (免费API)
  • dictionary- 本地字典翻译
  • auto      - 自动选择最佳翻译器

📋 使用示例:
  # 查看翻译状态
  python multi_translator.py --status

  # 使用DeepL翻译中文
  python multi_translator.py --auto-translate --language zh-CHS --translator deepl

  # 自动选择翻译器
  python multi_translator.py --auto-translate --language zh-CHS --translator auto

  # 完整流程
  python multi_translator.py --full-process --language zh-CHS --translator deepl
        """
    )

    parser.add_argument("--update-source", action="store_true",
                       help="更新源翻译文件")
    parser.add_argument("--auto-translate", action="store_true",
                       help="自动翻译")
    parser.add_argument("--compile", action="store_true",
                       help="编译翻译文件")
    parser.add_argument("--full-process", action="store_true",
                       help="完整流程: 更新 -> 翻译 -> 编译")
    parser.add_argument("--status", action="store_true",
                       help="显示翻译状态")

    parser.add_argument("--language", type=str,
                       help="目标语言 (如: zh-CHS, ja, ko)")
    parser.add_argument("--translator", type=str, default="auto",
                       choices=["openai", "deepl", "baidu", "google", "auto"],
                       help="翻译器选择")
    parser.add_argument("--all-translations", action="store_true",
                       help="翻译所有条目，不仅仅是未完成的")

    args = parser.parse_args()

    if not any([args.update_source, args.auto_translate, args.compile,
                args.full_process, args.status]):
        parser.print_help()
        return

    manager = EnhancedTranslationManager()

    try:
        if args.status:
            manager.show_translation_status()

        if args.update_source or args.full_process:
            manager.update_source_translations()

        if args.auto_translate or args.full_process:
            if not args.language:
                print("❌ 错误: 翻译需要指定 --language 参数")
                return

            language_files = manager.get_language_files()
            if args.language not in language_files:
                print(f"❌ 错误: 语言 '{args.language}' 未找到")
                print(f"📋 可用语言: {list(language_files.keys())}")
                return

            ts_file = language_files[args.language]
            await manager.auto_translate_file(
                ts_file, args.language, args.translator,
                not args.all_translations
            )

        if args.compile or args.full_process:
            manager.compile_translations()

        print("\n🎉 翻译管理完成!")

    except KeyboardInterrupt:
        print("\n\n❌ 操作被用户中断")
    except Exception as e:
        print(f"\n❌ 错误: {e}")

if __name__ == "__main__":
    asyncio.run(main())