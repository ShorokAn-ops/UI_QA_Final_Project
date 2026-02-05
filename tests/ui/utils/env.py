import os

def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing required env var: {name}")
    return v

def optional_env(name: str, default: str | None = None) -> str | None:
    return os.getenv(name, default)

