"""
Flask 入口
- 开发模式：前端由 Vite dev server 提供，Flask 只负责 API
- 部署模式：Flask 同时提供 API 和前端静态文件
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config, DEFAULT_SECRET_KEY
from api.routes import api_bp

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")


def create_app():
    app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
    app.config.from_object(Config)
    app.config["RESULTS_DIR"] = Config.RESULTS_DIR
    app.config["RUN_LOG_DIR"] = Config.RUN_LOG_DIR

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api_bp)

    # 导入攻击模块以触发注册
    from attacks.llm_scaling import register_attacks as register_llm_scaling_attacks
    register_llm_scaling_attacks()
    import attacks.wbc
    import attacks.sama
    import attacks.tab
    import attacks.reference_attack
    import attacks.resnet_lira_whitebox


    # ---------- 前端静态文件服务 ----------
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        """
        所有非 /api 的请求都返回前端页面。
        这样 React Router 的客户端路由才能正常工作。
        """
        file_path = os.path.join(STATIC_DIR, path)
        if path and os.path.exists(file_path):
            return send_from_directory(STATIC_DIR, path)
        # 对于所有其他路径，返回 index.html（React Router 接管）
        index_path = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(STATIC_DIR, "index.html")
        return {"message": "MIA Platform Backend. Frontend not built yet. Run: cd frontend && npm run build"}

    return app


if __name__ == "__main__":
    app = create_app()
    if Config.SECRET_KEY == DEFAULT_SECRET_KEY:
        print("WARNING: SECRET_KEY is not set, using the insecure default. "
              "Set the SECRET_KEY environment variable before exposing this server.")
    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
