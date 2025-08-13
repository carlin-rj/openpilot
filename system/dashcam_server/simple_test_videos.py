#!/usr/bin/env python3
"""
简单的测试视频生成器
生成基本的测试视频文件用于测试行车记录仪查看器
"""

import os
import sys
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

def generate_simple_video(output_path, duration=10, camera_type='fcamera'):
    """生成简单的测试视频"""

    # 根据摄像头类型设置不同的颜色和文本
    if camera_type == 'fcamera':
        color = 'blue'
        text = '前置摄像头'
        codec = 'libx265'
        ext = '.hevc'
    elif camera_type == 'dcamera':
        color = 'gray'
        text = '驾驶员摄像头'
        codec = 'libx265'
        ext = '.hevc'
    elif camera_type == 'ecamera':
        color = 'green'
        text = '广角摄像头'
        codec = 'libx265'
        ext = '.hevc'
    elif camera_type == 'qcamera':
        color = 'orange'
        text = '低质量摄像头'
        codec = 'libx264'
        ext = '.ts'

    output_path = output_path.with_suffix(ext)

    # 简化的ffmpeg命令
    cmd = [
      'ffmpeg', '-y',
      '-f', 'lavfi',
      '-i', f"color=c={color}:size=640x480:duration={duration}",
      '-vf',
      (
        # 动态文字上下移动
        f"drawtext=text='{text}':fontcolor=white:fontsize=24:"
        f"x=(w-text_w)/2:"
        f"y=H/2 + 50*sin(2*PI*t/2):"  # t是秒，正弦曲线上下摆动
        f":enable='between(t,0,{duration})',"
        # 显示动态时间
        f"drawtext=text='%{{localtime\\:%Y-%m-%d %H\\\\:%M\\\\:%S}}':"
        f"fontcolor=yellow:fontsize=18:x=10:y=10"
      ),
      '-c:v', codec,
      '-preset', 'ultrafast',
      '-t', str(duration),
      str(output_path)
    ]

    # 为qcamera添加简单音频
    if camera_type == 'qcamera':
        cmd = [
            'ffmpeg', '-y',
            '-f', 'lavfi',
            '-i', f'color=c={color}:size=640x480:duration={duration}',
            '-f', 'lavfi',
            '-i', f'sine=frequency=440:duration={duration}',
            '-vf', f'drawtext=text=\'{text}\':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2',
            '-c:v', codec,
            '-c:a', 'aac',
            '-preset', 'ultrafast',
            '-t', str(duration),
            '-shortest',
            str(output_path)
        ]

    print(f"生成 {camera_type}: {output_path}")
    try:
        result = subprocess.run(cmd, capture_output=True, check=True)
        print(f"✓ 成功: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ 失败: {e}")
        return False

def create_simple_test_data(base_path, num_segments=3):
    """创建简单的测试数据"""

    base_path = Path(base_path)
    base_path.mkdir(parents=True, exist_ok=True)

    dongle_id = "test_device_12345"
    start_time = datetime.now() - timedelta(hours=num_segments)

    print(f"在 {base_path} 创建 {num_segments} 个测试段")

    for i in range(num_segments):
        segment_time = start_time + timedelta(hours=i)
        timestamp_str = segment_time.strftime('%Y-%m-%d--%H-%M-%S')
        segment_dir_name = f"{dongle_id}|{timestamp_str}--{i}"
        segment_dir = base_path / segment_dir_name
        segment_dir.mkdir(exist_ok=True)

        print(f"\n创建段 {i+1}/{num_segments}: {segment_dir_name}")

        # 生成fcamera视频（最重要的）
        success = generate_simple_video(
            segment_dir / 'fcamera',
            duration=10,
            camera_type='fcamera'
        )

        if success:
            # 只有fcamera成功才生成其他的
            generate_simple_video(
                segment_dir / 'qcamera',
                duration=10,
                camera_type='qcamera'
            )

def main():
    print("🎥 简单测试视频生成器")
    print("=" * 40)

    # 检查ffmpeg
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        print("✓ ffmpeg 已安装")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ 未找到ffmpeg，请先安装")
        sys.exit(1)

    # 输出目录
    output_dir = os.path.expanduser("~/.comma/media/0/realdata")
    print(f"📁 输出目录: {output_dir}")

    # 生成测试数据
    try:
        create_simple_test_data(output_dir, 3)
        print("\n🎉 简单测试视频生成完成!")
        print("现在可以测试行车记录仪查看器了")

    except KeyboardInterrupt:
        print("\n⏹️ 已取消")
    except Exception as e:
        print(f"\n❌ 错误: {e}")

if __name__ == '__main__':
    main()
