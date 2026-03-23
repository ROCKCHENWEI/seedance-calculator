# Mesh2Splat MVP 操作手册（Windows + macOS）

## 1. 使用目标
在最短路径内完成一次可演示闭环：
1. 构建 Mesh2Splat。
2. 启动程序。
3. 导入 `.glb` 模型。
4. 查看 3DGS 渲染结果并完成验收记录。

---

## 2. Windows 主路径（推荐）

### 2.1 前置条件
- 操作系统：Windows 10/11
- 开发组件：Visual Studio 2019/2022，且勾选 `Desktop development with C++`
- CMake：>= 3.21.1
- 显卡驱动：最低要求 OpenGL 4.6 Core（项目 shader 使用 `#version 460 core`）
- 建议先做图形能力预检：通过显卡控制面板或 OpenGL 能力检测工具确认驱动版本与 OpenGL 版本

### 2.2 获取代码
```bash
git clone https://github.com/electronicarts/mesh2splat.git
cd mesh2splat
```

### 2.3 执行构建（Release）
```bat
:: cmd
run_build_release.bat

:: PowerShell
.\run_build_release.bat
```

脚本行为：
1. 清理旧的 `build` 和 `bin`
2. 重新生成 `build`
3. 运行 `cmake ..`
4. 运行 `cmake --build . --config Release`

### 2.4 启动程序
- 打开 `bin/Release`
- 运行 `Mesh2Splat.exe`

### 2.5 导入模型并验证
- 导入一个 `.glb` 模型（建议先用公开样例 `Box.glb` 验证环境）。
  - 目录链接：<https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Box/glTF-Binary>
  - 直接下载：<https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb>
- 验证是否能正常显示转换后的结果。
- 可切换可视化模式进行辅助检查（如 albedo、normal、depth）。

### 2.6 验收记录模板
- 机器信息（CPU/GPU/驱动版本）：
- 首次跑通时间：
- 是否成功导入 `.glb`：
- 是否成功显示 3DGS 结果：
- 遇到的问题与解决方式：

---

## 3. macOS 替代路径（MVP）

### 3.1 原则
MVP 阶段不做 native macOS 交付。  
macOS 用户通过 Windows 环境完成同等业务目标。

### 3.2 可选路径
1. 远程连接公司内 Windows 工作站
2. 使用云 Windows GPU 工作站
3. 使用可控的 Windows 虚拟化 + GPU 能力方案

### 3.3 操作步骤
1. 在 macOS 上完成远程接入配置。
2. 登录 Windows 环境后，完整复用“Windows 主路径”全部步骤。
3. 完成验收记录并回传团队。

---

## 4. 故障排查速查表

### 4.1 CMake 配置失败
- 检查 CMake 版本是否达到 3.21.1+
- 检查命令是否在仓库根目录执行

### 4.2 编译失败
- 检查 Visual Studio 是否安装 `Desktop development with C++`
- 检查编译工具链是否被系统识别

### 4.3 程序启动异常或渲染异常
- 更新显卡驱动
- 在满足图形能力的设备上复测

### 4.4 模型导入失败
- 确认模型格式为 `.glb`
- 优先用官方示例模型验证环境健康度

---

## 5. 最小验收口径（DoD）
以下 4 条全部满足才算 MVP 完成：
1. 构建成功
2. 程序可启动
3. `.glb` 导入成功
4. 3DGS 可视化结果正确显示

---

## 6. 建议产出物
- 一份运行截图（包含模型显示）
- 一份验收记录（文本即可）
- 一份故障与修复清单（若有）
