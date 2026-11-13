[English](README_EN.md) | 简体中文
# MIA Attack Demo Platform

成员推断攻击 (Membership Inference Attack) 演示平台。

## 快速开始

### 1. 安装环境

```bash
conda create -n mia_platform python=3.9
conda activate mia_platform
```

### 2. 启动后端（端口 5000）

```bash
cd backend && pip install -r requirements.txt && python app.py
```

后端通过以下环境变量配置：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `MIA_DEBUG` | `false` | 设为 `true` 时开启 Flask 调试模式。后端监听 `0.0.0.0`，调试模式下其他机器也能访问调试器，只应在本机开发时开启。 |
| `SECRET_KEY` | `mia-demo-secret` | Flask 密钥。未设置时使用不安全的默认值，启动时会打印警告；对外提供服务前请设置为随机字符串。 |

```bash
# bash
MIA_DEBUG=true SECRET_KEY=your-random-secret python app.py
```

```powershell
# PowerShell
$env:MIA_DEBUG = "true"; $env:SECRET_KEY = "your-random-secret"; python app.py
```

### 3. 启动前端（端口 5173，Vite proxy 将 `/api` 转发到后端）

```bash
cd frontend && npm install && npm run dev
```

在浏览器打开 http://localhost:5173 。

> 注意：新克隆的仓库中 `results/` 不存在（未纳入 Git），需先运行预计算脚本生成攻击分数，例如 `backend/attacks/llm_scaling/precompute_*.py`。

部署时：npm run build → 产物复制到 backend/static/ → 只启动 Flask，一个端口搞定

### 本机 HTTPS 演示地址

无需部署即可用产品化域名进行演示：`https://mia-platform`。该地址仅在当前电脑有效。

首次使用时，在 `frontend` 目录以**管理员身份**运行：

```powershell
npm.cmd run demo:setup
```

脚本会将 `mia-platform` 指向本机、创建一个仅供本机使用的证书，并将其加入当前 Windows 用户的受信任根证书库。随后启动后端，再运行：

```powershell
npm.cmd run demo
```

在浏览器打开 `https://mia-platform`。演示服务使用 HTTPS 默认端口 443，因此地址栏不再显示开发端口。若该端口被其他程序占用，可运行 `npm.cmd run demo:devport` 并访问 `https://mia-platform:5173`。证书文件保存于 `frontend/.cert`，不会提交到 Git；不要将它用于任何公网环境。

## 许可证

项目代码采用 [MIT License](LICENSE) 开源。所使用的第三方依赖、模型和数据集仍遵循各自的许可证与使用条款。
