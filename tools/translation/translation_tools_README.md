# OpenPilot 翻译管理工具使用指南

本项目提供了两个翻译管理脚本，用于收集、翻译和管理 OpenPilot 项目的多语言翻译。

## 工具概览

### 1. translation_manager.py (完整版本)
功能强大的翻译管理工具，支持：
- 自动扫描项目中的 tr() 翻译函数
- 使用 OpenAI API 进行自动翻译
- 支持多种语言
- 手动翻译模式
- 翻译状态报告

### 2. update_chinese.py (简化中文版)
专门为中文翻译优化的简化工具，支持：
- 内置中文翻译字典
- 快速更新中文翻译
- 无需 API 密钥
- 适合日常维护使用

## 前置要求

### 必需的系统工具
```bash
# 在 Ubuntu/Debian 系统上安装 Qt 开发工具
sudo apt-get install qt5-dev-tools qttools5-dev-tools

# 在 macOS 上安装 Qt 工具
brew install qt5
```

### Python 依赖 (仅 translation_manager.py 需要)
```bash
pip install requests
```

### OpenAI API (仅自动翻译需要)
```bash
export OPENAI_API_KEY="your-api-key-here"
```

## 使用方法

### 快速开始 - 更新中文翻译

使用简化的中文翻译工具：

```bash
# 进入工具目录
cd /Users/carlin/www/my-web/openpilot/tools

# 完整更新中文翻译（推荐）
python update_chinese.py

# 查看翻译状态
python update_chinese.py --status

# 列出未翻译的条目
python update_chinese.py --list-untranslated

# 强制重新翻译所有条目
python update_chinese.py --force

# 仅编译翻译文件
python update_chinese.py --compile-only
```

### 完整功能 - 使用完整版工具

#### 1. 更新翻译源文件
```bash
python translation_manager.py --update-source
```

#### 2. 查看所有语言翻译状态
```bash
python translation_manager.py --status
```

#### 3. 自动翻译特定语言
```bash
# 设置 OpenAI API 密钥
export OPENAI_API_KEY="your-api-key-here"

# 自动翻译中文简体
python translation_manager.py --auto-translate --language zh-CHS

# 自动翻译德语
python translation_manager.py --auto-translate --language de

# 翻译所有条目（包括已翻译的）
python translation_manager.py --auto-translate --language zh-CHS --all-translations
```

#### 4. 手动翻译模式
```bash
python translation_manager.py --manual-translate --language zh-CHS
```

#### 5. 编译翻译文件
```bash
python translation_manager.py --compile
```

#### 6. 完整流程（推荐）
```bash
python translation_manager.py --full-process --language zh-CHS
```

## 翻译文件结构

项目的翻译文件位于：
```
selfdrive/ui/translations/
├── languages.json          # 语言配置文件
├── main_zh-CHS.ts          # 中文简体翻译源文件
├── main_zh-CHS.qm          # 中文简体编译后文件
├── main_en.ts              # 英语翻译文件
├── main_de.ts              # 德语翻译文件
├── main_fr.ts              # 法语翻译文件
└── ...                     # 其他语言文件
```

## 翻译工作流程

### 标准工作流程
1. **更新源文件**: 使用 `lupdate` 扫描代码中的 tr() 函数
2. **翻译内容**: 使用字典翻译或 AI 翻译填充未翻译内容
3. **编译文件**: 使用 `lrelease` 生成 .qm 文件供程序使用

### 推荐的日常维护流程
```bash
# 1. 更新中文翻译（快速）
python update_chinese.py

# 2. 检查翻译状态
python update_chinese.py --status

# 3. 如有未翻译条目，可查看并手动处理
python update_chinese.py --list-untranslated --limit 50
```

## 内置翻译字典

`update_chinese.py` 包含了常用 UI 术语的中文翻译字典，涵盖：

- 基本操作：关闭、取消、确定、返回等
- 设备相关：设备、硬件、软件、网络等  
- OpenPilot 特定：实验模式、纵向控制、自适应巡航等
- 状态消息：加载中、连接中、完成、失败等
- 时间单位：小时、分钟、秒、天等

## 添加新的翻译

### 方法1：扩展翻译字典
编辑 `update_chinese.py` 中的 `TRANSLATION_DICT`：

```python
TRANSLATION_DICT = {
    # 添加新的翻译对
    "New Feature": "新功能",
    "Advanced Settings": "高级设置",
    # ...
}
```

### 方法2：使用自动翻译
```bash
export OPENAI_API_KEY="your-key"
python translation_manager.py --auto-translate --language zh-CHS
```

### 方法3：手动翻译
```bash
python translation_manager.py --manual-translate --language zh-CHS
```

## 故障排除

### 常见问题

1. **lupdate/lrelease 命令未找到**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install qt5-dev-tools
   
   # macOS
   brew install qt5
   export PATH="/usr/local/opt/qt5/bin:$PATH"
   ```

2. **编码问题**
   确保所有文件使用 UTF-8 编码保存

3. **权限问题**
   确保对翻译文件目录有写权限

4. **API 配额用完**
   使用内置字典翻译或手动翻译模式

### 调试模式

在脚本中添加详细输出：
```bash
python -v update_chinese.py --status
```

## 贡献翻译

如果您想为项目贡献翻译：

1. Fork 项目仓库
2. 使用翻译工具更新翻译
3. 提交 Pull Request
4. 确保包含 `.ts` 和 `.qm` 文件

## 支持的语言

当前支持的语言（参见 `languages.json`）：
- zh-CHS (中文简体)
- zh-CHT (中文繁体)  
- en (英语)
- de (德语)
- fr (法语)
- ja (日语)
- ko (韩语)
- es (西班牙语)
- pt-BR (巴西葡萄牙语)
- 等等...

## 许可证

这些工具遵循 OpenPilot 项目的许可证条款。