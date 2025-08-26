#!/usr/bin/env python3
"""
测试XML实体编码保持功能
"""

import pathlib
import xml.etree.ElementTree as ET
from multi_translator import EnhancedTranslationManager

# 创建测试XML内容
test_xml = '''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.1" language="zh_CN">
<context>
    <name>TestContext</name>
    <message>
        <source>for &quot;%1&quot;</source>
        <translation type="unfinished"></translation>
    </message>
    <message>
        <source>Hello &amp; World</source>
        <translation>你好 &amp; 世界</translation>
    </message>
    <message>
        <source>Test &lt;tag&gt;</source>
        <translation type="vanished"></translation>
    </message>
</context>
</TS>'''

def test_xml_entity_preservation():
    """测试XML实体编码保持功能"""
    
    # 创建测试文件
    test_file = pathlib.Path("test_entities.ts")
    with open(test_file, 'w', encoding='utf-8') as fp:
        fp.write(test_xml)
    
    print("📋 原始文件内容:")
    with open(test_file, 'r', encoding='utf-8') as fp:
        content = fp.read()
        print(content)
    
    try:
        # 解析并保存文件
        tree = ET.parse(test_file)
        
        manager = EnhancedTranslationManager()
        manager._save_ts_file(tree, test_file)
        
        print("\n📋 处理后文件内容:")
        with open(test_file, 'r', encoding='utf-8') as fp:
            new_content = fp.read()
            print(new_content)
        
        # 检查实体编码是否保持
        if '&quot;' in new_content:
            print("✅ XML实体编码 &quot; 得到保持")
        else:
            print("❌ XML实体编码 &quot; 丢失")
        
        if '&amp;' in new_content:
            print("✅ XML实体编码 &amp; 得到保持")
        else:
            print("❌ XML实体编码 &amp; 丢失")
            
        if '&lt;' in new_content and '&gt;' in new_content:
            print("✅ XML实体编码 &lt; 和 &gt; 得到保持")
        else:
            print("❌ XML实体编码 &lt; 或 &gt; 丢失")
        
    finally:
        # 清理测试文件
        # if test_file.exists():
        #     test_file.unlink()
        print("\n🧹 已清理测试文件")

if __name__ == "__main__":
    test_xml_entity_preservation()