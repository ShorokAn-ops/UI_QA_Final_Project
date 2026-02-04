import json
import datetime
import requests
from tests.ui.utils.env import require_env, optional_env


def _erp_base_url() -> str:
    return (optional_env("ERPNEXT_BASE_URL", "http://localhost:8080") or "").rstrip("/")


def _auth_headers() -> dict:
    key = require_env("ERPNEXT_API_KEY")
    secret = require_env("ERPNEXT_API_SECRET")
    return {
        "Authorization": f"token {key}:{secret}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }


def create_purchase_invoice_critical() -> str:
    """
    Create a Purchase Invoice in ERPNext that should result in CRITICAL risk.
    Returns ERPNext invoice_id (name).
    """

    base_url = _erp_base_url()
    url = f"{base_url}/api/resource/Purchase%20Invoice"

    supplier = optional_env("ERPNEXT_SUPPLIER", "NovaTech Trading")
    company = require_env("ERPNEXT_COMPANY")
    item_code = require_env("ERPNEXT_ITEM_ID")

    currency = optional_env("ERPNEXT_CURRENCY", "USD")
    conversion_rate = float(optional_env("ERPNEXT_CONVERSION_RATE", "1"))

    payload = {
        "supplier": supplier,
        "company": company,
        "posting_date": datetime.date.today().isoformat(),
        "currency": currency,
        "conversion_rate": conversion_rate,
        "items": [
            {
                "item_code": item_code,
                "qty": 30,
                "rate":10000.0,
            }
        ],
    }

    response = requests.post(
        url,
        headers=_auth_headers(),
        data=json.dumps(payload),
        timeout=5000,
    )

    if not response.ok:
        raise RuntimeError(
            "ERPNext create Purchase Invoice failed:\n"
            f"Status: {response.status_code}\n"
            f"URL: {url}\n"
            f"Payload: {json.dumps(payload, indent=2)}\n"
            f"Response: {response.text}"
        )

    data = response.json()
    invoice_id = (data.get("data") or {}).get("name")

    if not invoice_id:
        raise RuntimeError(f"ERPNext response missing invoice name: {response.text}")

    return invoice_id
