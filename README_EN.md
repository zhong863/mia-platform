
English | [简体中文](README.md)

# MIA Attack Demo Platform

An interactive platform for demonstrating and evaluating **Membership Inference Attacks (MIA)**. Explore registered attack methods, configure experiment parameters, execute attacks, and review evaluation metrics and visualizations through a web interface.

## Overview

Membership Inference Attacks aim to determine whether a particular data record was included in a machine learning model's training dataset.

This platform provides a unified environment for experimenting with different attack implementations and examining their results.

## Features

- **Multiple Attack Implementations:** Access registered membership inference attack methods through a unified interface.
- **Configurable Experiments:** Retrieve attack parameters and customize experiment configurations.
- **Evaluation Metrics:** Examine attack performance metrics and generated visualizations.
- **Experiment History:** Store and retrieve previous experiment results.
- **Result Caching:** Reuse cached experiment results when the same configuration is executed again.
- **Web Interface:** Interact with the platform through a React-based frontend and Flask backend.

## Technology Stack

| Component | Technology |
| --- | --- |
| Frontend | React, Vite |
| UI Components | Ant Design |
| Backend | Python, Flask |
| Data Processing | NumPy, PyTorch |
| API Communication | REST API |
| Development Server | Vite |

## Project Structure

```text
mia-platform/
├── backend/
│   ├── api/
│   │   └── routes.py
│   ├── attacks/
│   │   ├── llm_scaling/
│   │   ├── reference_attack/
│   │   ├── resnet_lira_whitebox/
│   │   ├── sama/
│   │   ├── tab/
│   │   └── wbc/
│   ├── core/
│   │   ├── metrics.py
│   │   ├── run_log_store.py
│   │   └── visualizer.py
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── scripts/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── results/
├── experiment_logs/
├── README.md
├── README_EN.md
└── LICENSE
```

*Note: `results/` and `experiment_logs/` are runtime directories and may not exist in a fresh clone.*

## Getting Started

### Prerequisites

Install the following before starting:

- Python 3.9
- Conda (recommended for Python environment management)
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/zhong863/mia-platform.git
cd mia-platform
```

### 2. Set Up the Python Environment

```bash
conda create -n mia_platform python=3.9
conda activate mia_platform
```

### 3. Install Backend Dependencies

From the project root:

```bash
cd backend
pip install -r requirements.txt
```

### 4. Start the Backend

```bash
python app.py
```

The Flask backend starts on:

```text
http://localhost:5000
```

Keep this terminal running.

### 5. Install Frontend Dependencies

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Open the following address in your browser:

```text
http://localhost:5173
```

The Vite development server automatically forwards `/api` requests to the Flask backend.

## API Reference

The backend exposes the following REST API endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/attacks` | List registered attacks |
| GET | `/api/attacks/{attack_id}/params` | Retrieve default attack parameters |
| GET | `/api/attacks/{attack_id}/data` | Discover available attack data |
| POST | `/api/attacks/{attack_id}/run` | Execute an attack |
| GET | `/api/runs` | Retrieve experiment history |
| GET | `/api/runs/{run_id}` | Retrieve a specific experiment record |

### Example: Execute an Attack

```json
{
  "data_path": "path/to/data",
  "params": {},
  "use_cache": true
}
```

Replace `path/to/data` with a valid dataset path and provide the parameters required by the selected attack.

## Configuration

The backend supports the following environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `MIA_DEBUG` | `false` | Enables Flask debug mode when set to `true`. |
| `SECRET_KEY` | `mia-demo-secret` | Flask application secret key. |

For local development in PowerShell:

```powershell
$env:MIA_DEBUG = "true"
$env:SECRET_KEY = "your-random-secret"
python app.py
```

**Security note:** The default secret key is intended only for local demonstrations. Set a secure random value before exposing the application to other users. Avoid enabling Flask debug mode in production.

## Local HTTPS Demo

The platform supports a local HTTPS demonstration address:

```text
https://mia-platform
```

This hostname is configured for use on the current Windows computer and is not a publicly accessible domain.

### First-time Setup

Open PowerShell in the `frontend` directory with administrator privileges and run:

```powershell
npm.cmd run demo:setup
```

The setup script:

- Configures the local hostname.
- Generates a certificate for local demonstration.
- Adds the certificate to the current Windows user's trusted root certificate store.

### Start the HTTPS Demo

Start the Flask backend first.

Then, from the `frontend` directory, run:

```powershell
npm.cmd run demo
```

Open:

```text
https://mia-platform
```

The demo uses HTTPS port 443.

If port 443 is already occupied, use:

```powershell
npm.cmd run demo:devport
```

Then visit:

```text
https://mia-platform:5173
```

Certificate files are stored in `frontend/.cert` and are not committed to Git.

**Important:** These certificates are intended exclusively for local demonstrations. Never use them in a public-facing deployment.

## Production Build

The frontend can be built into static files and served directly by Flask.

From the `frontend` directory:

```bash
npm run build
```

Vite generates the production frontend files in:

```text
backend/static/
```

After building, start the Flask backend:

```bash
cd ../backend
python app.py
```

The backend serves both the API and frontend from port 5000.

## Troubleshooting

| Problem | Suggested Solution |
| --- | --- |
| Python dependencies are missing | Activate the Conda environment and install `backend/requirements.txt`. |
| Frontend dependencies are missing | Run `npm install` inside `frontend/`. |
| Frontend cannot reach the API | Confirm that Flask is running on port 5000. |
| Port 5173 is occupied | Stop the conflicting process or configure another development port. |
| HTTPS certificate is unavailable | Run `npm.cmd run demo:setup` again from an administrator PowerShell session. |
| No attack data is available | Ensure the required datasets and precomputed results are present. |

**Data requirements:** A fresh clone may not contain the runtime `results/` directory. Some attack implementations require datasets or precomputed attack scores before they can execute. Check the documentation in the relevant attack directory for additional requirements.

## Contributing

Contributions, bug reports, and suggestions are welcome.

When proposing changes:

1. Keep changes focused and consistent with the existing architecture.
2. Test the affected functionality before submitting.
3. Provide a clear description of the changes in your pull request.

## License

The project code is distributed under the [MIT License](LICENSE).

Third-party dependencies, machine learning models, and datasets remain subject to their respective licenses and terms of use.

---

[简体中文](README.md) | [English](README_EN.md)
