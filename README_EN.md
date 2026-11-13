MIA Attack Demo Platform
A research-oriented platform for evaluating Membership Inference Attacks (MIAs) against machine-learning models. It brings attack configuration, experiment execution, metric reporting, and result inspection into one web interface.

The platform is designed for experiments involving large language models (LLMs) and vision-language models (VLMs), with support for black-box and white-box evaluation methods.
Overview
Membership inference attacks investigate whether a particular sample was used to train a target model. This platform provides a unified workflow for exploring that risk:
1. Choose an evaluation target — select the model and the relevant member/non-member data or prepared experiment results.
2. Configure an attack — choose an available method and adjust its supported parameters.
3. Run the evaluation — execute the selected attack through the Flask API.
4. Inspect the evidence — review evaluation metrics, visualizations, and saved experiment records.
Highlights
- Multiple attack methods: attack implementations are registered through a common backend interface.
- LLM and VLM workflows: methods are organized by model/task category.
- Black-box and white-box evaluation: supports methods that use model outputs as well as methods that rely on internal signals.
- Result visualizations: view generated charts and evaluation metrics, including ROC-based analysis where provided by an attack.
- Experiment history and caching: completed runs are stored so results can be revisited and eligible repeated runs can reuse cached results.
- Web-based interface: a React and Vite frontend communicates with a Flask API.
Research note: Membership-inference results are empirical evidence, not proof that a sample was or was not part of a model's training data. Interpret results in the context of the selected attack, dataset, model, and experimental setup.

Project structure
mia-platform/
├── backend/
│   ├── api/                 # Flask API routes
│   ├── attacks/              # Attack implementations and registry
│   ├── core/                 # Metrics, visualization, and run-log storage
│   ├── app.py                # Flask application entry point
│   ├── config.py             # Backend configuration
│   └── requirements.txt      # Backend Python dependencies
├── frontend/
│   ├── scripts/              # Local HTTPS setup helper
│   ├── src/                  # React application
│   ├── package.json
│   └── vite.config.js
├── README.md                 # Chinese documentation
├── README_EN.md              # English documentation
└── LICENSE
Requirements
- Python 3.9
- Conda (recommended for creating an isolated Python environment)
- Node.js and npm
- Git
Some attack methods may require additional model files, prepared datasets, or hardware resources. GPU availability depends on the installed PyTorch build and the selected method.
Quick start
1. Clone the repository
git clone https://github.com/zhong863/mia-platform.git
cd mia-platform
2. Create the Python environment
conda create -n mia_platform python=3.9
conda activate mia_platform
3. Install backend dependencies
Install the dependencies from the backend directory:
cd backend
pip install -r requirements.txt
Start the Flask API:
python app.py
The backend listens on http://localhost:5000 by default. Keep this terminal running.
4. Install and start the frontend
Open a second terminal at the repository root, activate the same Conda environment if desired, and run:
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.

During development, the Vite server forwards requests under /api to the Flask backend at http://localhost:5000.
Prepare experiment data
The repository does not include a generated results/ directory. Attack methods that read precomputed scores therefore need their expected result files before an evaluation can run.

For the LLM scaling workflows, the repository includes precomputation scripts in backend/attacks/llm_scaling/, including:
- precompute_collection.py
- precompute_document.py
- precompute_whitebox.py
Review the relevant script and attack implementation to determine the required input files, model settings, and output layout for your experiment. The data layout is method-specific; do not assume that one prepared result set works with every attack.
Configuration
The backend reads the following environment variables:
Variable	Default	Description
MIA_DEBUG	false	Set to true to enable Flask debug mode. Use only for local development.
SECRET_KEY	mia-demo-secret	Flask secret key. Set a strong, random value before exposing the application beyond your local machine.


macOS/Linux (Bash):
export MIA_DEBUG=true
export SECRET_KEY="replace-with-a-long-random-value"
python app.py
Windows (PowerShell):
$env:MIA_DEBUG = "true"
$env:SECRET_KEY = "replace-with-a-long-random-value"
python app.py
The application binds to 0.0.0.0 on port 5000. Debug mode can expose an interactive debugger, so do not enable it on a public or shared server. The default secret key is intended only for local demonstration.
Local HTTPS demo (Windows)
You can use the local hostname https://mia-platform for a product-style demonstration without deploying the application. This hostname is configured for the current computer only.
1. Create the local certificate
From the frontend directory, open PowerShell as Administrator and run:
npm.cmd run demo:setup
The setup script maps mia-platform to the local machine, creates a local-use certificate, and adds it to the trusted root certificate store for the current Windows user.
2. Start the backend
In a separate terminal, start Flask from the backend directory:
python app.py
3. Start the HTTPS frontend
In the frontend directory, run:
npm.cmd run demo
Then open https://mia-platform.

The demo uses HTTPS port 443. If that port is already occupied, run:
npm.cmd run demo:devport
Then visit https://mia-platform:5173.

The generated certificate files are stored in frontend/.cert/ and are excluded from Git. They are for local demonstrations only and must not be used in a public-facing deployment.
Build for deployment
Build the frontend from the frontend directory:
npm run build
Vite writes the build output to backend/static/. Then start Flask from the backend directory:
python app.py
Flask serves both the API and the built frontend, so the application can be accessed through the backend's port 5000.

For production use, run Flask behind a production-ready WSGI server and configure the reverse proxy, HTTPS, allowed origins, and secrets appropriately. Do not expose Flask's development server or enable debug mode on a public network.
API endpoints
The Flask API is mounted under /api:
Method	Endpoint	Purpose
GET	/api/attacks	List registered attack methods.
GET	/api/attacks/<attack_id>/params	Get an attack's default parameters.
GET	/api/attacks/<attack_id>/data	Discover available data for an attack.
POST	/api/attacks/<attack_id>/run	Run an attack using the supplied data path and parameters.
GET	/api/runs	List saved experiment records.
GET	/api/runs/<run_id>	Retrieve one experiment record and its result data.


For POST /api/attacks/<attack_id>/run, the request body accepts data_path, optional params, and optional use_cache (defaults to true). See backend/api/routes.py and the relevant attack implementation for method-specific parameter requirements.
Troubleshooting
Issue	What to check
Frontend cannot reach the API	Confirm Flask is running on port 5000 and that the Vite proxy is enabled.
No data is available for an attack	Check that the required experiment files exist under the expected results/ layout.
An attack reports missing files	Review that attack's data-discovery and score-loading logic, then run the appropriate preparation workflow.
Local HTTPS setup fails	Run the setup command from frontend in an elevated PowerShell window and check whether port 443 is already in use.
PyTorch cannot use the GPU	Verify that the installed PyTorch build matches the machine's CUDA environment; CPU execution may be available depending on the attack.


License
The project code is released under the MIT License. Third-party dependencies, models, and datasets may be governed by separate licenses and terms of use. Check the relevant terms before using or redistributing them.
