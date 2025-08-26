# OpenPilot 多翻译器管理工具

本项目提供了多翻译器管理系统，支持多种翻译引擎的集成和自动翻译。

## 主要工具

### multi_translator.py - 多翻译器核心
- 🌐 支持5种翻译引擎：OpenAI、DeepL、百度翻译、谷歌翻译
- 🔄 自动翻译器选择和故障转移
- ⚡ 异步并发翻译
- 🗑️ 自动处理废弃翻译条目（vanished）
- 📊 翻译状态报告

### translate.sh - 快捷脚本
简化的命令行工具，提供常用操作的快捷方式。

## 安装依赖

### 系统工具
```bash
# Ubuntu/Debian
sudo apt-get install qt5-dev-tools qttools5-dev-tools

# macOS
brew install qt5
```

### Python依赖
```bash
pip install requests aiohttp
```

## 翻译服务配置

### OpenAI
```bash
export OPENAI_API_KEY="your-api-key"
```

### DeepL（推荐，无需配置）
使用免费服务：https://deepl.borber.top

### 百度翻译
```bash
export BAIDU_APP_ID="your-app-id"
export BAIDU_SECRET_KEY="your-secret-key"
```

### 谷歌翻译
使用免费API，无需配置。

## 使用方法

### 🚀 快捷脚本（推荐）

```bash
cd /Users/carlin/www/my-web/openpilot/tools/translation

# 查看帮助
./translate.sh help

# 测试翻译器
./translate.sh test

# 查看翻译状态
./translate.sh status

# 使用DeepL翻译中文
./translate.sh deepl

# 使用谷歌翻译中文
./translate.sh google

# 自动选择翻译器
./translate.sh auto

# 完整流程（更新->翻译->编译）
./translate.sh full

# 仅编译
./translate.sh compile
```

### 🔧 直接使用Python脚本

```bash
# 测试翻译器可用性
python test_translators.py

# 查看翻译状态
python multi_translator.py --status

# 使用指定翻译器
python multi_translator.py --auto-translate --language zh-CHS --translator deepl
python multi_translator.py --auto-translate --language zh-CHS --translator google
python multi_translator.py --auto-translate --language zh-CHS --translator auto

# 完整流程
python multi_translator.py --full-process --language zh-CHS --translator auto

# 翻译其他语言
python multi_translator.py --auto-translate --language ja --translator deepl  # 日语
python multi_translator.py --auto-translate --language ko --translator deepl  # 韩语
```

## 翻译流程

1. **更新源文件**: 使用 `lupdate` 扫描代码中的翻译函数
2. **自动翻译**: 使用AI翻译引擎翻译未完成的条目
3. **清理废弃**: 自动移除 `vanished` 类型的翻译条目
4. **编译文件**: 使用 `lrelease` 生成 .qm 文件

## 支持的语言

- zh-CHS (中文简体)
- zh-CHT (中文繁体)
- ja (日语)
- ko (韩语)
- de (德语)
- fr (法语)
- es (西班牙语)
- pt-BR (巴西葡萄牙语)

## 故障排除

### 常见问题

**1. lupdate/lrelease 命令未找到**
```bash
# Ubuntu/Debian
sudo apt-get install qt5-dev-tools

# macOS
brew install qt5
```

**2. 翻译器不可用**
```bash
# 测试翻译器状态
./translate.sh test
```

**3. API配额问题**
使用免费的DeepL或谷歌翻译器。

**4. XML实体编码问题**
系统已自动处理XML实体编码保持（如 `&quot;`、`&amp;` 等）。

## 翻译文件位置

```
selfdrive/ui/translations/
├── languages.json          # 语言配置
├── main_zh-CHS.ts          # 中文翻译源文件
├── main_zh-CHS.qm          # 中文编译文件
└── ...                     # 其他语言文件
```