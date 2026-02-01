import requests
from tests.ui.utils.env import optional_env

def run_backend_sync() -> dict:
    base = (optional_env("BACKEND_BASE_URL", "http://localhost:8081") or "").rstrip("/")
    url = f"{base}/sync/run"

    r = requests.post(url, headers={"Accept": "application/json"}, timeout=30)
    if not r.ok:
        raise RuntimeError(f"Backend /sync/run failed: {r.status_code} {r.text}")

    return r.json()
