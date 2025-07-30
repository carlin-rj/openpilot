![](https://user-images.githubusercontent.com/47793918/233812617-beab2e71-57b9-479e-8bff-c3931347ca40.png)

## 🚀 C3 分支特色功能

> **本分支基于 sunnypilot 开发，专为 C3 设备优化，提供额外的安全和便利功能**

### 🎥 行车记录仪服务系统
- **📱 专用移动应用**: 独立开发的 [Flutter 应用](https://github.com/carlin-rj/openpilot-dashcam-app)，提供流畅的视频查看体验
- **🖥️ Web 管理界面**: 支持浏览器访问，查看和管理行车记录
- **🎬 多摄像头支持**: fcamera、dcamera、ecamera、qcamera 全方位记录
- **📡 HLS 流媒体**: 高效的视频流传输和播放
- **⬇️ 视频下载**: 支持原始文件下载和管理

### 👁️ 驾驶员分心检测模式
- **🔍 智能监控**: 实时检测驾驶员注意力状态，提升行车安全
- **⚠️ 分心警报**: 当检测到驾驶员分心时及时提醒
- **📊 行为分析**: 记录和分析驾驶员注意力模式
- **⚙️ 灵敏度调节**: 可根据个人习惯调整检测敏感度

### 🚫 驾驶员监控开关功能
- **🔧 完全控制**: 可完全关闭驾驶员监控功能，保护隐私
- **🎛️ 灵活配置**: 支持临时或永久关闭选项
- **⚡ 即时生效**: 设置更改立即生效，无需重启

---

## 🌞 What is sunnypilot?
[sunnypilot](https://github.com/sunnyhaibin/sunnypilot) is a fork of comma.ai's openpilot, an open source driver assistance system. sunnypilot offers the user a unique driving experience for over 300+ supported car makes and models with modified behaviors of driving assist engagements. sunnypilot complies with comma.ai's safety rules as accurately as possible.

## 💭 Join our Discord
Join the official sunnypilot Discord server to stay up to date with all the latest features and be a part of shaping the future of sunnypilot!
* https://discord.gg/sunnypilot

  ![](https://dcbadge.vercel.app/api/server/wRW3meAgtx?style=flat) ![Discord Shield](https://discordapp.com/api/guilds/880416502577266699/widget.png?style=shield)

## Documentation
https://docs.sunnypilot.ai/ is your one stop shop for everything from features to installation to FAQ about the sunnypilot

## 🚘 Running on a dedicated device in a car
* A supported device to run this software
    * a [comma three](https://comma.ai/shop/products/three) or a [C3X](https://comma.ai/shop/comma-3x)
* This software
* One of [the 300+ supported cars](https://github.com/commaai/openpilot/blob/master/docs/CARS.md). We support Honda, Toyota, Hyundai, Nissan, Kia, Chrysler, Lexus, Acura, Audi, VW, Ford and more. If your car is not supported but has adaptive cruise control and lane-keeping assist, it's likely able to run sunnypilot.
* A [car harness](https://comma.ai/shop/products/car-harness) to connect to your car

Detailed instructions for [how to mount the device in a car](https://comma.ai/setup).

## Installation
Please refer to [Recommended Branches](#-recommended-branches) to find your preferred/supported branch. This guide will assume you want to install the latest `c3-dev` branch with enhanced features.

> 🌟 **C3 分支优势**: 安装本分支将获得行车记录仪服务、驾驶员分心检测、监控开关等独有功能！

* sunnypilot not installed or you installed a version before 0.8.17?
  1. [Factory reset/uninstall](https://github.com/commaai/openpilot/wiki/FAQ#how-can-i-reset-the-device) the previous software if you have another software/fork installed.
  2. After factory reset/uninstall and upon reboot, select `Custom Software` when given the option.
  3. Input the installation URL per [Recommended Branches](#-recommended-branches). Example: ```release-c3.sunnypilot.ai```.
  4. Complete the rest of the installation following the onscreen instructions.

* sunnypilot already installed and you installed a version after 0.8.17?
  1. On the comma three, go to `Settings` ▶️ `Software`.
  2. At the `Download` option, press `CHECK`. This will fetch the list of latest branches from sunnypilot.
  3. At the `Target Branch` option, press `SELECT` to open the Target Branch selector.
  4. Scroll to select the desired branch per  Recommended Branches (see below). Example: `release-c3`

|    Branch    |         Installation URL         |                    特色功能                    |
|:------------:|:--------------------------------:|:--------------------------------------------:|
| `release-c3` | https://release-c3.sunnypilot.ai |              标准 sunnypilot 功能              |
| `staging-c3` | https://staging-c3.sunnypilot.ai |              标准 sunnypilot 功能              |
|   `dev-c3`   | https://dev-c3.sunnypilot.ai     |              标准 sunnypilot 功能              |
|   `c3-dev`   | 🚀 **本分支 (推荐)** |  **行车记录仪 + 分心检测 + 监控开关** |

### If you want to use our newest branches (our rewrite)
> [!TIP]
>You can see the rewrite state on our [rewrite project board](https://github.com/orgs/sunnypilot/projects/2), and to install the new branches, you can use the following links


> [!IMPORTANT]
> It is recommended to [re-flash AGNOS](https://flash.comma.ai/) if you intend to downgrade from the new branches.
> You can still restore the latest sunnylink backup made on the old branches.

|      Branch      |                 Installation URL              |
|:----------------:|:---------------------------------------------:|
| `staging-c3-new` | `https://staging-c3-new.sunnypilot.ai`        |
|   `dev-c3-new`   | `https://dev-c3-new.sunnypilot.ai`            |
| `custom-branch`  | `https://install.sunnypilot.ai/{branch_name}` |
| `release-c3-new` |            **Not yet available**.             |

> [!TIP]
> Do you require further assistance with software installation? Join the [sunnypilot Discord server](https://discord.sunnypilot.com) and message us in the `#installation-help` channel.

## 🎆 Pull Requests
We welcome both pull requests and issues on GitHub. Bug fixes are encouraged.

Pull requests should be against the most current `master-new` branch.

## 📊 User Data

By default, sunnypilot uploads the driving data to comma servers. You can also access your data through [comma connect](https://connect.comma.ai/).

sunnypilot is open source software. The user is free to disable data collection if they wish to do so.

sunnypilot logs the road-facing camera, CAN, GPS, IMU, magnetometer, thermal sensors, crashes, and operating system logs.
The driver-facing camera and microphone are only logged if you explicitly opt-in in settings.

By using this software, you understand that use of this software or its related services will generate certain types of user data, which may be logged and stored at the sole discretion of comma. By accepting this agreement, you grant an irrevocable, perpetual, worldwide right to comma for the use of this data.

## Licensing

sunnypilot is released under the [MIT License](LICENSE). This repository includes original work as well as significant portions of code derived from [openpilot by comma.ai](https://github.com/commaai/openpilot), which is also released under the MIT license with additional disclaimers.

The original openpilot license notice, including comma.ai’s indemnification and alpha software disclaimer, is reproduced below as required:

> openpilot is released under the MIT license. Some parts of the software are released under other licenses as specified.
>
> Any user of this software shall indemnify and hold harmless Comma.ai, Inc. and its directors, officers, employees, agents, stockholders, affiliates, subcontractors and customers from and against all allegations, claims, actions, suits, demands, damages, liabilities, obligations, losses, settlements, judgments, costs and expenses (including without limitation attorneys’ fees and costs) which arise out of, relate to or result from any use of this software by user.
>
> **THIS IS ALPHA QUALITY SOFTWARE FOR RESEARCH PURPOSES ONLY. THIS IS NOT A PRODUCT.
> YOU ARE RESPONSIBLE FOR COMPLYING WITH LOCAL LAWS AND REGULATIONS.
> NO WARRANTY EXPRESSED OR IMPLIED.**

For full license terms, please see the [`LICENSE`](LICENSE) file.

## 💰 Support sunnypilot
If you find any of the features useful, consider becoming a [sponsor on GitHub](https://github.com/sponsors/sunnyhaibin) to support future feature development and improvements.


By becoming a sponsor, you will gain access to exclusive content, early access to new features, and the opportunity to directly influence the project's development.


<h3>GitHub Sponsor</h3>

<a href="https://github.com/sponsors/sunnyhaibin">
  <img src="https://user-images.githubusercontent.com/47793918/244135584-9800acbd-69fd-4b2b-bec9-e5fa2d85c817.png" alt="Become a Sponsor" width="300" style="max-width: 100%; height: auto;">
</a>
<br>

<h3>PayPal</h3>

<a href="https://paypal.me/sunnyhaibin0850" target="_blank">
<img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="PayPal this" title="PayPal - The safer, easier way to pay online!" border="0" />
</a>
<br></br>

Your continuous love and support are greatly appreciated! Enjoy 🥰

<span>-</span> Jason, Founder of sunnypilot

---

## 🎯 C3 分支详细功能说明

### 📱 行车记录仪服务系统
本分支集成了完整的行车记录仪查看系统，让您可以随时查看和管理行车记录：

- **移动应用**: [openpilot-dashcam-app](https://github.com/carlin-rj/openpilot-dashcam-app) - 专用的 Flutter 移动应用
- **Web 界面**: 通过浏览器访问 `http://设备IP:8009` 查看视频
- **多摄像头**: 支持前置、驾驶员、广角、低质量四个摄像头
- **视频管理**: 按路线和时间段组织，支持筛选和下载

### 👁️ 驾驶员分心检测
基于计算机视觉技术，实时监控驾驶员状态：

- **实时检测**: 持续监控驾驶员眼部和头部动作
- **智能警报**: 检测到分心时通过声音和视觉提醒
- **数据记录**: 记录分心事件，帮助改善驾驶习惯
- **个性化**: 可调整检测敏感度适应不同驾驶员

### 🔧 驾驶员监控开关
完全的隐私控制权：

- **一键关闭**: 可完全禁用驾驶员摄像头监控
- **灵活设置**: 支持临时关闭或永久关闭
- **即时生效**: 设置立即生效，无需重启系统
- **隐私保护**: 尊重用户隐私选择

### 🚀 如何使用这些功能

1. **安装 C3 分支**: 使用本仓库的代码安装到您的 C3 设备
2. **启用行车记录仪**: 在设置中开启行车记录仪服务
3. **下载移动应用**: 从 [GitHub](https://github.com/carlin-rj/openpilot-dashcam-app) 下载 APK 安装
4. **配置分心检测**: 在设置中调整分心检测参数
5. **设置监控开关**: 根据需要开启或关闭驾驶员监控

> 💡 **提示**: 这些功能专为提升驾驶安全和用户体验而设计，建议根据实际需求合理使用。
