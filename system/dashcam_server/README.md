# 行车记录仪查看器

这是一个为 openpilot/sunnypilot 开发的行车记录仪查看接口，支持通过Web浏览器和移动设备查看录制的行车视频。

## ✨ 核心功能特性

### 🎥 多摄像头支持
- **前置摄像头 (fcamera)**: 主要道路视图，HEVC编码
- **驾驶员摄像头 (dcamera)**: 驾驶员监控视图，支持分心检测
- **广角摄像头 (ecamera)**: 广角道路视图
- **低质量摄像头 (qcamera)**: H.264编码，包含音频

### 🌐 多端访问
- **📱 移动应用**: 独立的 Flutter 应用，性能优异 (推荐)
- **🖥️ Web界面**: 基础Web界面 (性能有限，建议使用移动应用)
- **🔌 RESTful API**: 完整的API接口支持第三方集成
- **🎮 HLS流媒体**: 支持HLS流媒体播放和原始视频下载

### 🚀 行车记录仪功能
- 📊 路线和视频段智能管理
- 🎬 HLS流媒体视频播放
- 🔍 按日期、摄像头类型筛选
- 📅 路线时间范围查看
- 📷 多摄像头视角切换
- ⬇️ 原始视频文件下载
- 📈 系统信息和统计
- 🔄 实时数据更新

## 🚀 快速开始

### 📋 系统要求

- **操作系统**: OpenPilot/SunnyPilot 环境
- **Python**: 3.8+
- **内存**: 最低 2GB RAM
- **存储**: 视频数据存储空间
- **网络**: 局域网连接

### ⚡ 启动服务

#### 通过 SunnyPilot 设置界面
1. 进入 SunnyPilot 设置界面
2. 找到 "行车记录仪服务器" 选项
3. 点击开关启用服务
4. 服务将自动在后台运行 (默认端口 8009)

#### 手动启动服务器
```bash
# 基本启动 (默认端口 8009)
cd /data/openpilot
python system/dashcam_server/dashcam_server.py
```

### 🌐 访问方式

#### 📱 移动应用 (推荐)
下载并安装专用的 Flutter 移动应用：
```
https://github.com/carlin-rj/openpilot-dashcam-app
```
- ✅ 性能优异，流畅体验
- ✅ 原生界面，操作便捷
- ✅ 完整功能支持

#### 🖥️ Web 浏览器 (基础功能)
```
http://设备IP:8009/mobile.html
http://设备IP:8009/mobile_routes.html
```
⚠️ **注意**: Web端存在性能问题，建议使用移动应用

#### 🔌 API 接口
```
http://设备IP:8009/api/
```

## 📡 API 接口文档

### 🔧 核心 API

#### 系统信息
```http
GET /api/info
```
**响应示例:**
```json
{
  "total_routes": 150,
  "total_segments": 3000,
  "total_size": 1073741824,
  "available_cameras": ["fcamera", "dcamera", "ecamera", "qcamera"],
  "date_range": ["2024-01-01T00:00:00", "2024-12-31T23:59:59"]
}
```

#### 路线管理
```http
GET /api/routes?page=1&limit=20
GET /api/routes/{route_name}
```

#### 视频段管理
```http
GET /api/segments?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31&camera=fcamera
GET /api/segments/{segment_id}
```

#### 视频流媒体
```http
# HLS 流媒体播放列表
GET /api/hls/{segment_id}/{camera}/playlist.m3u8

# HLS 视频片段
GET /api/hls/{segment_id}/{camera}/{filename}

# 直接视频流
GET /api/video/{segment_id}/{camera}

# 原始视频文件下载
GET /api/video/raw/{segment_id}/{camera}
```

## 📁 项目结构

```
system/dashcam_server/
├── dashcam_server.py           # 🚀 主服务器 (aiohttp)
├── manage_dashcam_serverd.py   # 🔧 服务管理器
├── simple_test_videos.py       # 🧪 测试脚本
├── web/                        # 🌐 Web界面 (基础功能)
│   ├── mobile.html            # 📱 移动端主界面
│   ├── mobile_routes.html     # 📱 移动端路线列表
│   ├── route_player.html      # 🎬 路线播放器
│   ├── css/
│   │   ├── style.css          # 🎨 主样式文件
│   │   └── all.min.css        # 📦 FontAwesome样式
│   ├── js/
│   │   ├── dashcam.js         # ⚡ 主要JavaScript逻辑
│   │   └── hls.min.js         # 🎥 HLS播放器
│   └── webfonts/              # 🔤 字体文件
└── README.md                   # 📖 项目文档

📱 移动应用 (独立仓库):
https://github.com/carlin-rj/openpilot-dashcam-app
├── lib/
│   ├── main.dart              # 🎯 应用入口
│   ├── models/                # 📊 数据模型
│   ├── providers/             # 🔄 状态管理
│   ├── screens/               # 📱 界面页面
│   └── services/              # 🌐 API 服务
├── pubspec.yaml               # 📦 依赖配置
└── android/                   # 🤖 Android 配置
```

### 🗄️ 数据存储
- **文件系统**: 视频文件直接存储
- **路径**: `/data/media/0/realdata/` (设备) 或 `~/.comma/media/0/realdata/` (PC)
- **格式**: HEVC, H.264, TS 等多种视频格式

## 📖 使用指南

### 📱 移动应用 (推荐)

#### 🚀 安装方式
1. 访问 [openpilot-dashcam-app](https://github.com/carlin-rj/openpilot-dashcam-app)
2. 下载最新版本的 APK 文件
3. 在手机上安装应用
4. 配置服务器地址 (设备IP:8009)

#### 🎯 主要功能
- **🏠 主页**: 系统概览和快速访问
- **📋 路线列表**: 浏览所有行车记录
- **🎮 视频播放**: 流畅的视频播放体验
- **📷 多摄像头**: 无缝切换不同视角
- **⚙️ 设置**: 服务器配置和播放偏好

### 🖥️ Web 界面 (基础功能)

⚠️ **性能提醒**: Web端存在性能限制，建议使用移动应用获得更好体验

#### 🎯 主要页面
- **mobile.html**: 移动端主界面，显示系统信息
- **mobile_routes.html**: 路线列表页面
- **route_player.html**: 视频播放页面

#### 🎨 界面特性
- **📐 响应式设计**: 基础的移动端适配
- **👆 触摸支持**: 简单的触摸交互
- **🔄 数据加载**: 基础的数据展示

## 🔧 故障排除

### ❓ 常见问题

#### 🚫 服务无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :8009

# 查看详细日志
tail -f /tmp/dashcam_server.log
```

#### 🎥 视频播放问题
- **HEVC 不支持**: 使用 qcamera (H.264) 或启用浏览器硬件解码
- **网络延迟**: 检查设备网络连接，尝试降低播放质量
- **文件损坏**: 检查原始视频文件完整性

#### 📱 移动应用问题
- **连接失败**: 确认服务器地址和端口配置正确
- **播放卡顿**: 检查网络带宽，尝试切换到 qcamera
- **应用崩溃**: 查看应用日志，重启应用

#### 日志分析
```bash
# 实时日志
tail -f /tmp/dashcam_server.log

# 错误日志筛选
grep -i error /tmp/dashcam_server.log

# 性能日志
grep -i "slow\|timeout" /tmp/dashcam_server.log
```

#### 视频播放测试
1. 访问 `http://localhost:8009/`
2. 测试不同摄像头的视频播放
3. 验证HLS流媒体功能

## 🤝 贡献指南

### 🐛 报告问题
1. 使用 GitHub Issues 报告 bug
2. 提供详细的复现步骤
3. 包含系统环境信息
4. 附上相关日志文件

### 💡 功能请求
1. 在 Issues 中描述新功能需求
2. 说明使用场景和预期效果
3. 讨论实现方案

### 🔀 提交代码
1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request

## 📄 许可证

本项目采用 **MIT 许可证**，详见 [LICENSE](../../LICENSE) 文件。

## 🛠️ 开发指南

### 🚀 开发环境搭建

#### 后端开发
```bash
# 进入项目目录
cd /data/openpilot/system/dashcam_server

# 启动开发服务器
python dashcam_server.py --port 8009
```

#### 移动应用开发
移动应用已迁移到独立仓库，获得更好的开发体验：
```bash
# 克隆移动应用仓库
git clone https://github.com/carlin-rj/openpilot-dashcam-app.git
cd openpilot-dashcam-app

# 安装Flutter依赖
flutter pub get

# 启动开发模式
flutter run
```

### 🧪 测试

#### API测试
```bash
# 测试API接口
curl http://localhost:8009/api/info
curl http://localhost:8009/api/routes
```

## 🙏 致谢

感谢 OpenPilot 和 SunnyPilot 社区的支持和贡献。

---

**📞 联系方式**
- **服务器项目**: [OpenPilot Repository](https://github.com/carlin-rj/openpilot)
- **移动应用**: [Dashcam App Repository](https://github.com/carlin-rj/openpilot-dashcam-app)
- **问题反馈**: [GitHub Issues](https://github.com/carlin-rj/openpilot/issues)
