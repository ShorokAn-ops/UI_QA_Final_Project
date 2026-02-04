import json
import datetime
import requests
from tests.ui.utils.env import require_env, optional_env
import time

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
    Handles nginx 504 timeout gracefully (invoice may still be created server-side).
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
                "rate": 10000.0,
            }
        ],
    }

    last_error = None

    # Retry because ERPNext may create the invoice but nginx times out (504)
    for attempt in range(1, 4):
        try:
            response = requests.post(
                url,
                headers=_auth_headers(),
                json=payload,          # ✅ correct usage
                timeout=60,            # ✅ realistic timeout
            )

            if response.ok:
                data = response.json()
                invoice_id = (data.get("data") or {}).get("name")
                if not invoice_id:
                    raise RuntimeError(
                        f"ERPNext response missing invoice name: {response.text}"
                    )
                return invoice_id

            # nginx timeout – request may still succeed server-side
            if response.status_code == 504:
                last_error = RuntimeError(
                    f"Attempt {attempt}: nginx 504 timeout while creating invoice"
                )
                time.sleep(8)
                continue

            # Any other HTTP error
            raise RuntimeError(
                "ERPNext create Purchase Invoice failed:\n"
                f"Status: {response.status_code}\n"
                f"URL: {url}\n"
                f"Payload: {json.dumps(payload, indent=2)}\n"
                f"Response: {response.text}"
            )

        except requests.RequestException as e:
            last_error = e
            time.sleep(5)

    # All retries failed
    raise RuntimeError(
        "Failed to create Purchase Invoice after retries.\n"
        f"Last error: {last_error}"
    )


def delete_purchase_invoice(invoice_id: str) -> None:
    """
    Delete a Purchase Invoice from ERPNext by name.
    Used as teardown to keep test environment clean.
    """
    if not invoice_id:
        return

    base_url = _erp_base_url()
    url = f"{base_url}/api/resource/Purchase%20Invoice/{invoice_id}"

    response = requests.delete(
        url,
        headers=_auth_headers(),
        timeout=60,
    )

    if not response.ok:
        raise RuntimeError(
            "ERPNext delete Purchase Invoice failed:\n"
            f"Status: {response.status_code}\n"
            f"URL: {url}\n"
            f"Response: {response.text}"
        )
