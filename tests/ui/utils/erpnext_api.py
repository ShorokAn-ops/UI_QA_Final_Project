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
    Create a Purchase Invoice in ERPNext (Draft / Save only).
    Returns ERPNext invoice_id (name).
    """
    import uuid
    import time
    import json
    import datetime
    import requests

    base_url = _erp_base_url()
    url = f"{base_url}/api/resource/Purchase%20Invoice"

    supplier = optional_env("ERPNEXT_SUPPLIER", "NovaTech Trading")
    company = require_env("ERPNEXT_COMPANY")
    item_code = require_env("ERPNEXT_ITEM_ID")

    currency = optional_env("ERPNEXT_CURRENCY", "USD")
    conversion_rate = float(optional_env("ERPNEXT_CONVERSION_RATE", "1"))

    # Unique marker so we can find the invoice even if POST times out
    marker = f"ui-test-draft-critical-{uuid.uuid4()}"

    payload = {
        "supplier": supplier,
        "company": company,
        "posting_date": datetime.date.today().isoformat(),
        "currency": currency,
        "conversion_rate": conversion_rate,
        "remarks": marker,
        "docstatus": 0,  # Explicitly keep Draft
        "items": [
            {
                "item_code": item_code,
                "qty": 30,
                "rate": 10000.0,
            }
        ],
    }

    try:
        # Prefer json=payload; and allow slower ERPNext responses
        response = requests.post(
            url,
            headers=_auth_headers(),
            json=payload,
            timeout=(45, 180),
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
        if invoice_id:
            return invoice_id

    except requests.exceptions.ReadTimeout:
        # ERPNext may have saved the invoice but didn't respond in time
        pass

    # Fallback: search for the created Draft invoice by remarks marker
    search_url = f"{base_url}/api/resource/Purchase%20Invoice"
    params = {
        "fields": '["name","remarks","docstatus","creation"]',
        "filters": json.dumps([
            ["Purchase Invoice", "remarks", "=", marker],
            ["Purchase Invoice", "docstatus", "=", 0],
        ]),
        "limit_page_length": 1,
        "order_by": "creation desc",
    }

    for _ in range(8):
        time.sleep(2)
        r = requests.get(search_url, headers=_auth_headers(), params=params)
        if r.ok:
            rows = (r.json().get("data") or [])
            if rows:
                return rows[0]["name"]

    raise RuntimeError(
        "ERPNext invoice may have been saved as Draft but could not be confirmed.\n"
        f"Marker: {marker}"
    )
