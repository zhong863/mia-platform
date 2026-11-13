[English](README_EN.md) | 简体中文
# MIA Attack Demo Platform

成员推断攻击 (Membership Inference Attack) 演示平台。

## 快速开始

### 1. 安装环境

```bash
conda create -n mia_platform python=3.9
conda activate mia_platform
pip install -r requirements.txt
```

开发时：前端  npx vite（端口5173）+ 后端 python app.py（端口5000），Vite proxy 转发 API
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
