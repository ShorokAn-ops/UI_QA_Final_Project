import requests
from tests.ui.utils.env import optional_env

def _ui_base_url() -> str:
    return (optional_env("UI_BASE_URL", "http://localhost:3001") or "").rstrip("/")

def create_purchase_invoice_critical() -> str:
    """
    Create a Purchase Invoice via Next.js API that should result in CRITICAL risk.
    Returns ERPNext invoice_id (name).
    """
    url = f"{_ui_base_url()}/api/test/invoice"
    
    response = requests.post(url, timeout=90)
    
    if not response.ok:
        raise RuntimeError(
            f"Failed to create invoice via Next.js API:\n"
            f"Status: {response.status_code}\n"
            f"Response: {response.text}"
        )
    
    data = response.json()
    invoice_id = data.get("invoice_id")
    if not invoice_id:
        raise RuntimeError(f"Next.js response missing invoice_id: {response.text}")
    
    return invoice_id


def delete_purchase_invoice(invoice_id: str) -> None:
    """
    Delete a Purchase Invoice via Next.js API.
    Used as teardown to keep test environment clean.
    """
    if not invoice_id:
        return

    url = f"{_ui_base_url()}/api/test/invoice?id={invoice_id}"
    
    response = requests.delete(url, timeout=60)
    
    if not response.ok:
        raise RuntimeError(
            f"Failed to delete invoice via Next.js API:\n"
            f"Status: {response.status_code}\n"
            f"Response: {response.text}"
        )
