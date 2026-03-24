# Mesh2Splat 本地部署（Windows / macOS）

中文文档、脚本与验收清单，用于在本地构建与使用 [Electronic Arts Mesh2Splat](https://github.com/electronicarts/mesh2splat)（网格快速转为 3D Gaussian Splatting）。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 快速入口

| 用途 | 链接 |
|------|------|
| Windows 最快测试 | [docs/mesh2splat/WINDOWS_QUICKSTART.md](docs/mesh2splat/WINDOWS_QUICKSTART.md) |
| 文档总览 | [docs/mesh2splat/README.md](docs/mesh2splat/README.md) |
| MVP 验收 | [docs/mesh2splat/MVP_ACCEPTANCE.md](docs/mesh2splat/MVP_ACCEPTANCE.md) |

## 仓库结构

```
├── docs/mesh2splat/   # 部署与构建说明
├── scripts/           # Windows PowerShell / macOS Shell
├── patches/           # CMake macOS 补丁（相对上游）
├── LICENSE
└── README.md
```

## 说明

- **可执行程序**不在本仓库中；请按文档克隆官方 `electronicarts/mesh2splat` 后在本地编译。
- 若将本仓库与 `mesh2splat` 放在**同级目录**，可使用 `scripts/mesh2splat-win-build.ps1`（Windows）或 `scripts/mesh2splat-macos-build.sh`（macOS）辅助构建。

## License

[MIT](LICENSE)
