#!/bin/bash
# OpenPilot 翻译管理快捷脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印彩色文本
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 显示帮助信息
show_help() {
    echo "🌐 OpenPilot 翻译管理脚本"
    echo "========================"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  test          - 测试所有翻译器"
    echo "  status        - 显示翻译状态"
    echo "  deepl         - 使用DeepL翻译中文"
    echo "  auto          - 自动选择翻译器翻译中文"
    echo "  full          - 完整流程（更新源文件->翻译->编译）"
    echo "  compile       - 仅编译翻译文件"
    echo "  help          - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 test       # 测试翻译器"
    echo "  $0 deepl      # 使用DeepL翻译"
    echo "  $0 google     # 使用google翻译"
    echo "  $0 full       # 完整翻译流程"
}

# 检查Python依赖
check_dependencies() {
    print_info "检查Python依赖..."
    
    if ! python3 -c "import aiohttp" 2>/dev/null; then
        print_warning "缺少 aiohttp 依赖，正在安装..."
        pip3 install aiohttp requests
    fi
    
    if ! python3 -c "import requests" 2>/dev/null; then
        print_warning "缺少 requests 依赖，正在安装..."
        pip3 install requests
    fi
    
    print_success "依赖检查完成"
}

# 测试翻译器
test_translators() {
    print_info "开始测试翻译器..."
    python3 test_translators.py
}

# 显示翻译状态
show_status() {
    print_info "显示翻译状态..."
    python3 multi_translator.py --status
}

# 使用DeepL翻译
deepl_translation() {
    print_info "使用DeepL翻译中文..."
    python3 multi_translator.py --auto-translate --language zh-CHS --translator deepl
}

google_translation() {
    print_info "使用Google翻译中文..."
    python3 multi_translator.py --auto-translate --language zh-CHS --translator google
}

# 自动翻译
auto_translation() {
    print_info "自动选择翻译器翻译中文..."
    python3 multi_translator.py --auto-translate --language zh-CHS --translator auto
}

# 完整流程
full_process() {
    print_info "开始完整翻译流程..."
    python3 multi_translator.py --full-process --language zh-CHS --translator auto
}

# 编译翻译文件
compile_translations() {
    print_info "编译翻译文件..."
    python3 multi_translator.py --compile
}

# 主逻辑
main() {
    case "${1:-help}" in
        "test")
            check_dependencies
            test_translators
            ;;
        "status")
            check_dependencies
            show_status
            ;;
        "deepl")
            check_dependencies
            deepl_translation
            ;;
        "google")
            check_dependencies
            google_translation
            ;;
        "auto")
            check_dependencies
            auto_translation
            ;;
        "full")
            check_dependencies
            full_process
            ;;
        "compile")
            compile_translations
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知选项: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 错误处理
trap 'print_error "脚本执行被中断"' INT

# 执行主函数
main "$@"