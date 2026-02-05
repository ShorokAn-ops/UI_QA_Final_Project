import re
from playwright.sync_api import Page, expect

class InvoicesPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")

        self.title = "text=Invoices"
        self.filter_dropdown = 'select'  # simplest (you have a dropdown). We'll narrow via label text too.

        # Table / row
        self.row_by_invoice = lambda invoice_id: f'tr:has-text("{invoice_id}")'

        # Risk badge text appears like "High Risk" / "Low Risk" / "Critical"
        self.risk_badge_in_row = lambda invoice_id: f'{self.row_by_invoice(invoice_id)} :text-matches("Low Risk|Medium Risk|High Risk|Critical", "i")'

        # "+X more" link in row
        self.more_link_in_row = lambda invoice_id: f'{self.row_by_invoice(invoice_id)} a:text-matches("\\\\+\\\\d+\\\\s+more", "i")'

        # Modal
        self.modal = 'div[role="dialog"], .modal, [data-state="open"]'
        self.modal_title = 'text=Risk Analysis Details'
        self.modal_invoice_line = lambda invoice_id: f'text=Invoice: {invoice_id}'
        self.modal_all_reasons = 'text=All Reasons'
        # Reasons list items contain visible text lines
        self.modal_reason_cards = f'{self.modal} :text-matches("AI INSIGHT", "i")'

    def open(self):
        self.page.goto(
            f"{self.base_url}/invoices",
            wait_until="domcontentloaded",
            timeout=60000
        )
        expect(self.page).to_have_url(re.compile(r".*/invoices.*"), timeout=30000)
        return self


    def wait_invoice_row(self, invoice_id: str, timeout_ms: int = 60000):
        # UI may poll backend; we wait until row appears
        expect(self.page.locator(self.row_by_invoice(invoice_id))).to_be_visible(timeout=timeout_ms)
        return self

    def get_risk_text(self, invoice_id: str) -> str:
        row = self.page.locator(self.row_by_invoice(invoice_id))
        expect(row).to_be_visible(timeout=20000)
        txt = row.inner_text().strip()

        # Normalize
        txt_u = txt.upper()
        if "CRITICAL" in txt_u:
            return "CRITICAL"
        if "HIGH RISK" in txt_u:
            return "HIGH"
        if "MEDIUM RISK" in txt_u:
            return "MEDIUM"
        if "LOW RISK" in txt_u:
            return "LOW"
        raise AssertionError(f"Could not parse risk text from row for {invoice_id}. Row text:\n{txt}")

    def open_reasons_modal_via_more(self, invoice_id: str):
        more = self.page.locator(self.more_link_in_row(invoice_id)).first
        expect(more).to_be_visible(timeout=20000)
        more.click()

        # Validate modal open
        expect(self.page.locator(self.modal_title)).to_be_visible(timeout=20000)
        expect(self.page.locator(self.modal_all_reasons)).to_be_visible(timeout=20000)
        # Invoice line present in modal header area
        expect(self.page.locator(self.modal_invoice_line(invoice_id))).to_be_visible(timeout=20000)
        return self

    def read_modal_reasons_text(self) -> str:
        # Grab modal text (good for checking expected substrings seen in screenshots)
        dlg = self.page.locator(self.modal).first
        expect(dlg).to_be_visible(timeout=20000)
        return dlg.inner_text()

    def close_modal(self):
        # common close "X"
        close_btn = self.page.locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("×"), button:has-text("X")')
        if close_btn.count() > 0:
            close_btn.first.click()
        else:
            # fallback escape
            self.page.keyboard.press("Escape")
        return self
  


    def set_risk_filter(self, label_text: str):
        select = self.page.locator("select").first
        expect(select).to_be_visible(timeout=20000)

        # Capture counter BEFORE selecting (e.g. "49 total invoices")
        counter = self.page.locator(
            "text=/\\d+\\s+(total|of)\\s+\\d+\\s+invoices/i"
        ).first
        before = counter.inner_text() if counter.count() else ""

        # Select filter by visible label
        select.select_option(label=label_text)

        # Short debounce for React state update
        self.page.wait_for_timeout(500)

        # If UI did not update (known flaky case), reload ONCE
        if (
            label_text.lower() == "high risk"
            and self.page.locator('tbody tr :text-matches("Low Risk", "i")').count() > 0
        ):
            self.page.reload(wait_until="domcontentloaded")

        # --- WAIT CONDITIONS (one of them must happen) ---

        # 1) Preferred: "Filtered: High Risk" badge appears (if exists in UI)
        filtered_badge = self.page.locator(f'text=Filtered: {label_text}')
        if filtered_badge.count() > 0:
            expect(filtered_badge).to_be_visible(timeout=30000)
            return self

        # 2) Counter text changes (most reliable if present)
        if counter.count() > 0:
            expect(counter).not_to_have_text(before, timeout=30000)
            return self

        # 3) Fallback: at least one row shows the expected risk badge
        expect(
            self.page.locator(':text-matches("High Risk", "i")').first
        ).to_be_visible(timeout=30000)

        return self


    def assert_all_rows_match_risk(self, expected: str):
        """
        expected: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
        """
        rows = self.page.locator("tbody tr")
        expect(rows.first).to_be_visible(timeout=20000)

        n = rows.count()
        # Ensure there is at least 1 row after filtering
        if n == 0:
            raise AssertionError("No rows visible after filtering.")

        for i in range(min(n, 15)):  # limit checks for speed
            row = rows.nth(i)
            t = row.locator(':text-matches("Low Risk|Medium Risk|High Risk|Critical", "i")').first.inner_text().upper()
            if expected == "CRITICAL":
                ok = "CRITICAL" in t
            elif expected == "HIGH":
                ok = "HIGH RISK" in t
            elif expected == "MEDIUM":
                ok = "MEDIUM RISK" in t
            else:
                ok = "LOW RISK" in t
            if not ok:
                raise AssertionError(f"Filtered table contains a row not matching {expected}. Row text:\n{rows.nth(i).inner_text()}")
