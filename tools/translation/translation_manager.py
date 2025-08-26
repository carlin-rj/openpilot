#!/usr/bin/env python3
"""
OpenPilot Translation Manager
用于收集项目中的tr翻译并插入到TS文件中，然后执行翻译的工具

使用方法:
1. 更新翻译源文件: python translation_manager.py --update-source
2. 自动翻译: python translation_manager.py --auto-translate --language zh-CHS
3. 生成QM文件: python translation_manager.py --compile
4. 完整流程: python translation_manager.py --full-process --language zh-CHS
"""

import argparse
import json
import os
import pathlib
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional, Set, Tuple

# 项目路径配置
PROJECT_ROOT = pathlib.Path(__file__).resolve().parent.parent
UI_DIR = PROJECT_ROOT / "selfdrive" / "ui"
TRANSLATIONS_DIR = UI_DIR / "translations"
LANGUAGES_FILE = TRANSLATIONS_DIR / "languages.json"

# 翻译配置
OPENAI_MODEL = "gpt-4"
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

class TranslationManager:
    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.ui_dir = UI_DIR
        self.translations_dir = TRANSLATIONS_DIR
        self.languages_file = LANGUAGES_FILE
        
    def find_tr_strings(self) -> Set[Tuple[str, str, str]]:
        """
        在项目中查找所有tr翻译字符串
        返回: Set[(context, source_text, location)]
        """
        tr_strings = set()
        
        # 定义要搜索的文件模式
        search_patterns = [
            "**/*.cc",
            "**/*.cpp", 
            "**/*.h",
            "**/*.hpp"
        ]
        
        # 正则表达式匹配tr函数调用
        tr_pattern = re.compile(r'tr\s*\(\s*"([^"]+)"\s*\)')
        qobject_tr_pattern = re.compile(r'QObject::tr\s*\(\s*"([^"]+)"\s*\)')
        
        for pattern in search_patterns:
            for file_path in self.ui_dir.rglob(pattern):
                if file_path.is_file():
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                        # 获取相对路径作为context
                        relative_path = file_path.relative_to(self.ui_dir)
                        context = str(relative_path.parent).replace('/', '_') or "QObject"
                        
                        # 查找tr调用
                        for match in tr_pattern.finditer(content):
                            source_text = match.group(1)
                            location = f"{relative_path}:{self._get_line_number(content, match.start())}"
                            tr_strings.add((context, source_text, location))
                            
                        # 查找QObject::tr调用
                        for match in qobject_tr_pattern.finditer(content):
                            source_text = match.group(1)
                            location = f"{relative_path}:{self._get_line_number(content, match.start())}"
                            tr_strings.add(("QObject", source_text, location))
                            
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
                        
        return tr_strings
    
    def _get_line_number(self, content: str, position: int) -> int:
        """获取位置对应的行号"""
        return content[:position].count('\n') + 1
    
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
        print("Updating source translations using lupdate...")
        
        try:
            # 使用lupdate扫描所有UI文件并更新翻译
            cmd = ["lupdate", "-recursive", str(self.ui_dir), "-ts"]
            
            # 添加所有TS文件
            language_files = self.get_language_files()
            for ts_file in language_files.values():
                cmd.append(str(ts_file))
                
            if not language_files:
                print("No language files found!")
                return
                
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✓ Source translations updated successfully")
                print(result.stdout)
            else:
                print(f"✗ lupdate failed: {result.stderr}")
                
        except FileNotFoundError:
            print("✗ lupdate not found. Please install Qt development tools.")
        except Exception as e:
            print(f"✗ Error running lupdate: {e}")
    
    def auto_translate_file(self, ts_file: pathlib.Path, language: str, 
                           only_unfinished: bool = True) -> None:
        """自动翻译TS文件"""
        if not OPENAI_API_KEY:
            print("OpenAI API key not found. Set OPENAI_API_KEY environment variable.")
            return
            
        print(f"Auto-translating {language} ({ts_file})...")
        
        try:
            import requests
        except ImportError:
            print("requests library not found. Install with: pip install requests")
            return
            
        try:
            tree = ET.parse(ts_file)
            root = tree.getroot()
            
            for context in root.findall("./context"):
                context_name = context.find("name")
                if context_name is None:
                    continue
                    
                print(f"Processing context: {context_name.text}")
                
                for message in context.findall("./message"):
                    source = message.find("source")
                    translation = message.find("translation")
                    
                    if source is None or translation is None:
                        continue
                        
                    # 跳过已翻译的条目（如果只翻译未完成的）
                    if only_unfinished and translation.attrib.get("type") != "unfinished":
                        continue
                        
                    # 跳过空字符串
                    if not source.text or not source.text.strip():
                        continue
                        
                    try:
                        llm_translation = self._translate_with_openai(source.text, language)
                        
                        if llm_translation:
                            print(f"  ✓ '{source.text}' -> '{llm_translation}'")
                            translation.text = llm_translation
                            # 移除unfinished标记
                            if "type" in translation.attrib:
                                del translation.attrib["type"]
                        else:
                            print(f"  ✗ Failed to translate: '{source.text}'")
                            
                    except Exception as e:
                        print(f"  ✗ Translation error for '{source.text}': {e}")
                        
            # 保存文件
            self._save_ts_file(tree, ts_file)
            print(f"✓ Auto-translation completed for {language}")
            
        except Exception as e:
            print(f"✗ Error processing {ts_file}: {e}")
    
    def _translate_with_openai(self, text: str, language: str) -> Optional[str]:
        """使用OpenAI API翻译文本"""
        try:
            import requests
        except ImportError:
            return None
            
        # 构建提示
        prompt = f"You are a professional translator from English to {language}. " + \
                f"The following sentence or word is in the GUI of a software called openpilot, " + \
                f"translate it accordingly. Only return the translation, no explanations."
        
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                json={
                    "model": OPENAI_MODEL,
                    "messages": [
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": text}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 200
                },
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                print(f"OpenAI API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Translation API error: {e}")
            return None
    
    def _save_ts_file(self, tree: ET.ElementTree, file_path: pathlib.Path) -> None:
        """保存TS文件"""
        root = tree.getroot()
        
        with open(file_path, 'w', encoding='utf-8') as fp:
            fp.write('<?xml version="1.0" encoding="utf-8"?>\n')
            fp.write('<!DOCTYPE TS>\n')
            fp.write(ET.tostring(root, encoding='unicode'))
    
    def compile_translations(self) -> None:
        """编译TS文件为QM文件"""
        print("Compiling translations to QM files...")
        
        language_files = self.get_language_files()
        
        for language, ts_file in language_files.items():
            qm_file = ts_file.with_suffix('.qm')
            
            try:
                cmd = ["lrelease", str(ts_file), "-qm", str(qm_file)]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    print(f"✓ Compiled {language}: {qm_file}")
                else:
                    print(f"✗ Failed to compile {language}: {result.stderr}")
                    
            except FileNotFoundError:
                print("✗ lrelease not found. Please install Qt development tools.")
                break
            except Exception as e:
                print(f"✗ Error compiling {ts_file}: {e}")
    
    def manual_translate_file(self, ts_file: pathlib.Path, language: str) -> None:
        """手动翻译模式 - 显示需要翻译的条目"""
        print(f"Manual translation mode for {language} ({ts_file})")
        print("Enter translations for each untranslated string (press Enter to skip):")
        print("=" * 60)
        
        try:
            tree = ET.parse(ts_file)
            root = tree.getroot()
            modified = False
            
            for context in root.findall("./context"):
                context_name = context.find("name")
                if context_name is None:
                    continue
                    
                for message in context.findall("./message"):
                    source = message.find("source")
                    translation = message.find("translation")
                    
                    if source is None or translation is None:
                        continue
                        
                    # 只处理未翻译的条目
                    if translation.attrib.get("type") != "unfinished":
                        continue
                        
                    print(f"\nContext: {context_name.text}")
                    print(f"Source: {source.text}")
                    
                    user_translation = input("Translation: ").strip()
                    
                    if user_translation:
                        translation.text = user_translation
                        if "type" in translation.attrib:
                            del translation.attrib["type"]
                        modified = True
                        print("✓ Translation saved")
                    else:
                        print("✗ Skipped")
                        
            if modified:
                self._save_ts_file(tree, ts_file)
                print(f"\n✓ Manual translations saved for {language}")
            else:
                print(f"\n✓ No changes made for {language}")
                
        except KeyboardInterrupt:
            print("\n\n✗ Manual translation interrupted")
        except Exception as e:
            print(f"✗ Error in manual translation: {e}")
    
    def show_translation_status(self) -> None:
        """显示翻译状态"""
        print("Translation Status Report")
        print("=" * 50)
        
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
                
                print(f"{language:10} | {translated:4}/{total:4} ({completion:5.1f}%) | "
                      f"Unfinished: {unfinished:4}")
                      
            except Exception as e:
                print(f"{language:10} | Error reading file: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="OpenPilot Translation Manager",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # 更新翻译源文件
  python translation_manager.py --update-source
  
  # 自动翻译中文简体
  python translation_manager.py --auto-translate --language zh-CHS
  
  # 手动翻译中文简体
  python translation_manager.py --manual-translate --language zh-CHS
  
  # 编译所有翻译文件
  python translation_manager.py --compile
  
  # 完整流程：更新源文件 -> 自动翻译 -> 编译
  python translation_manager.py --full-process --language zh-CHS
  
  # 查看翻译状态
  python translation_manager.py --status
        """
    )
    
    parser.add_argument("--update-source", action="store_true",
                       help="Update source translations using lupdate")
    parser.add_argument("--auto-translate", action="store_true",
                       help="Auto-translate using OpenAI API")
    parser.add_argument("--manual-translate", action="store_true",
                       help="Manual translation mode")
    parser.add_argument("--compile", action="store_true",
                       help="Compile TS files to QM files")
    parser.add_argument("--full-process", action="store_true",
                       help="Full process: update -> translate -> compile")
    parser.add_argument("--status", action="store_true",
                       help="Show translation status")
    
    parser.add_argument("--language", type=str,
                       help="Target language (e.g., zh-CHS, fr, de)")
    parser.add_argument("--all-translations", action="store_true",
                       help="Translate all strings, not just unfinished ones")
    
    args = parser.parse_args()
    
    if not any([args.update_source, args.auto_translate, args.manual_translate,
                args.compile, args.full_process, args.status]):
        parser.print_help()
        return
    
    manager = TranslationManager()
    
    try:
        if args.status:
            manager.show_translation_status()
            
        if args.update_source or args.full_process:
            manager.update_source_translations()
            
        if args.auto_translate or args.full_process:
            if not args.language:
                print("Error: --language is required for translation")
                return
                
            language_files = manager.get_language_files()
            if args.language not in language_files:
                print(f"Error: Language '{args.language}' not found")
                print(f"Available languages: {list(language_files.keys())}")
                return
                
            ts_file = language_files[args.language]
            manager.auto_translate_file(ts_file, args.language, 
                                      not args.all_translations)
            
        if args.manual_translate:
            if not args.language:
                print("Error: --language is required for manual translation")
                return
                
            language_files = manager.get_language_files()
            if args.language not in language_files:
                print(f"Error: Language '{args.language}' not found")
                return
                
            ts_file = language_files[args.language]
            manager.manual_translate_file(ts_file, args.language)
            
        if args.compile or args.full_process:
            manager.compile_translations()
            
        print("\n✓ Translation management completed!")
        
    except KeyboardInterrupt:
        print("\n\n✗ Operation interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")

if __name__ == "__main__":
    main()