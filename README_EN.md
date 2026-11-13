English | [简体中文](README.md)

# MIA Attack Demo Platform

A demo platform for Membership Inference Attacks (MIA).

## Quick Start

### 1. Set up the environment

```bash
conda create -n mia_platform python=3.9
conda activate mia_platform
pip install -r requirements.txt
```

Development: frontend `npx vite` (port 5173) + backend `python app.py` (port 5000). The Vite proxy forwards API requests.
Deployment: `npm run build` → copy the build output to `backend/static/` → start only Flask. Everything is served from a single port.

### Local HTTPS demo address

You can demo the platform under a product-style domain without deploying it: `https://mia-platform`. This address only works on the current computer.

The first time, run the following in the `frontend` directory **as administrator**:

```powershell
npm.cmd run demo:setup
```

The script points `mia-platform` to your machine, creates a certificate for local use only, and adds it to the trusted root certificate store of the current Windows user. Then start the backend and run:

```powershell
npm.cmd run demo
```

Open `https://mia-platform` in your browser. The demo server uses the default HTTPS port 443, so the address bar no longer shows a development port. If that port is occupied by another program, run `npm.cmd run demo:devport` and visit `https://mia-platform:5173`. The certificate files are stored in `frontend/.cert` and are not committed to Git. Do not use them in any public-facing environment.

## License

The project code is open-sourced under the [MIT License](LICENSE). Third-party dependencies, models and datasets used by the project remain subject to their own licenses and terms of use.