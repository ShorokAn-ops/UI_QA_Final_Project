import re
from playwright.sync_api import Page, expect

class RiskUIInvoicesPage:
    """Page Object for Risk UI Invoices page at http://localhost:3001/invoices"""
    
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")
        
        # Locators
        self.title = "text=Invoices"
        self.filter_dropdown = 'select'
        
        # Table / row helpers
        self.row_by_invoice = lambda invoice_id: f'tr:has-text("{invoice_id}")'
        self.risk_badge_in_row = lambda invoice_id: f'{self.row_by_invoice(invoice_id)} :text-matches("Low Risk|Medium Risk|High Risk|Critical", "i")'
        self.more_link_in_row = lambda invoice_id: f'{self.row_by_invoice(invoice_id)} a:text-matches("\\+\\d+\\s+more", "i")'
        
        # Modal
        self.modal = 'div[role="dialog"], .modal, [data-state="open"]'
        self.modal_title = 'text=Risk Analysis Details'
        self.modal_all_reasons = 'text=All Reasons'
        self.modal_invoice_line = lambda invoice_id: f'text=Invoice: {invoice_id}'
        self.modal_ai_insights = ':text-matches("AI INSIGHT", "i")'
        
    def open(self):
        """Navigate to invoices page"""
        self.page.goto(
            f"{self.base_url}/invoices",
            wait_until="domcontentloaded",
            timeout=60000
        )
        expect(self.page).to_have_url(re.compile(r".*/invoices.*"), timeout=30000)
        return self
    
    def set_risk_filter(self, label: str):
        """
        Set risk filter dropdown to specific label (e.g., "High Risk")
        Waits for UI to update after filtering
        Note: This filter changes the URL query param which triggers React to re-render
        """
        select = self.page.locator("select#risk-filter").first
        expect(select).to_be_visible(timeout=20000)
        
        # Map label to value for URL check
        label_to_value = {
            "Low Risk": "LOW",
            "Medium Risk": "MEDIUM",
            "High Risk": "HIGH",
            "Critical": "CRITICAL"
        }
        risk_value = label_to_value.get(label, label.upper())
        
        # Use Playwright's select_option which properly triggers React events
        select.select_option(value=risk_value)
        
        # Wait for React transition to complete and URL to update
        # startTransition can delay the navigation
        self.page.wait_for_timeout(2000)
        
        # Wait for URL to update with risk_level parameter
        expect(self.page).to_have_url(re.compile(f"risk_level={risk_value}", re.IGNORECASE), timeout=15000)
        
        # Wait for "Filtered: {label}" badge to appear (confirms filter applied)
        filtered_badge = self.page.locator(f'text=Filtered: {label}')
        expect(filtered_badge).to_be_visible(timeout=10000)
        
        # Wait for table to update - look for risk badge in tbody matching the filter
        # Give it time for React to re-render the filtered list
        self.page.wait_for_timeout(500)
        
        # Verify at least one row with matching risk level exists in table
        risk_badge_in_table = self.page.locator(f'tbody tr :text-matches("{label}", "i")')
        
        try:
            expect(risk_badge_in_table.first).to_be_visible(timeout=15000)
        except Exception as e:
            # Debug: capture current state
            current_url = self.page.url
            table_text = self.page.locator("tbody").inner_text() if self.page.locator("tbody").count() > 0 else "No table"
            raise AssertionError(
                f"Filter '{label}' did not produce expected results. "
                f"URL: {current_url}\n"
                f"No rows with '{label}' found in table.\n"
                f"Current table content (first 500 chars):\n{table_text[:500]}"
            ) from e
        
        return self
    
    def wait_for_invoice(self, invoice_id: str, timeout_ms: int = 60000):
        """Wait for invoice row to appear in table (UI may poll backend)"""
        expect(self.page.locator(self.row_by_invoice(invoice_id))).to_be_visible(timeout=timeout_ms)
        return self
    
    def get_row_by_invoice_id(self, invoice_id: str):
        """Get row locator for specific invoice ID"""
        row = self.page.locator(self.row_by_invoice(invoice_id))
        expect(row).to_be_visible(timeout=20000)
        return row
    
    def open_more_reasons_for_row(self, row):
        """
        Click "+X more" link in a given row
        Args:
            row: Playwright Locator for the row
        """
        more = row.locator('a:text-matches("\\+\\d+\\s+more", "i")').first
        expect(more).to_be_visible(timeout=20000)
        more.click()
        
        # Validate modal opened
        dlg = self.page.locator(self.modal).first
        expect(dlg).to_be_visible(timeout=20000)
        expect(self.page.locator(self.modal_title)).to_be_visible(timeout=20000)
        expect(self.page.locator(self.modal_all_reasons)).to_be_visible(timeout=20000)
        return self
    
    def assert_row_risk(self, row, expected_label: str):
        """
        Assert row shows expected risk label
        Args:
            row: Playwright Locator for the row
            expected_label: e.g., "High Risk", "Low Risk", "Critical"
        """
        risk_text = row.locator(':text-matches("Low Risk|Medium Risk|High Risk|Critical", "i")').first
        expect(risk_text).to_have_text(re.compile(expected_label, re.IGNORECASE), timeout=10000)
        return self
    
    def assert_modal_has_ai_insights(self):
        """Assert modal contains at least one AI INSIGHT"""
        dlg = self.page.locator(self.modal).first
        expect(dlg).to_be_visible(timeout=20000)
        
        # Wait for AI INSIGHT to appear
        ai_insight = dlg.locator(self.modal_ai_insights).first
        expect(ai_insight).to_be_visible(timeout=30000)
        
        # Ensure modal text is substantial (reasons loaded)
        txt = dlg.inner_text()
        if len(txt.strip()) <= 50:
            raise AssertionError("Modal text too short; reasons may not be loaded.")
        
        return self
    
    # Additional helper methods used by existing tests
    
    def wait_invoice_row(self, invoice_id: str, timeout_ms: int = 60000):
        """Alias for wait_for_invoice"""
        return self.wait_for_invoice(invoice_id, timeout_ms)
    
    def get_risk_text(self, invoice_id: str) -> str:
        """Get normalized risk text from invoice row"""
        row = self.get_row_by_invoice_id(invoice_id)
        txt = row.inner_text().strip().upper()
        
        if "CRITICAL" in txt:
            return "CRITICAL"
        if "HIGH RISK" in txt:
            return "HIGH"
        if "MEDIUM RISK" in txt:
            return "MEDIUM"
        if "LOW RISK" in txt:
            return "LOW"
        raise AssertionError(f"Could not parse risk text from row for {invoice_id}. Row text:\n{txt}")
    
    def open_reasons_modal_via_more(self, invoice_id: str):
        """Open reasons modal by clicking +X more link for specific invoice"""
        more = self.page.locator(self.more_link_in_row(invoice_id)).first
        expect(more).to_be_visible(timeout=20000)
        more.click()
        
        # Validate modal open with invoice context
        expect(self.page.locator(self.modal_title)).to_be_visible(timeout=20000)
        expect(self.page.locator(self.modal_all_reasons)).to_be_visible(timeout=20000)
        expect(self.page.locator(self.modal_invoice_line(invoice_id))).to_be_visible(timeout=20000)
        return self
    
    def read_modal_reasons_text(self) -> str:
        """Get modal text content for assertion"""
        dlg = self.page.locator(self.modal).first
        expect(dlg).to_be_visible(timeout=20000)
        return dlg.inner_text()
    
    def close_modal(self):
        """Close the modal"""
        close_btn = self.page.locator('button:has-text("Close"), button[aria-label="Close"], button:has-text("×"), button:has-text("X")')
        if close_btn.count() > 0:
            close_btn.first.click()
        else:
            # Fallback escape
            self.page.keyboard.press("Escape")
        return self
    
    def assert_all_rows_match_risk(self, expected: str):
        """
        Assert all visible rows (up to 15) match expected risk level
        Args:
            expected: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
        """
        rows = self.page.locator("tbody tr")
        expect(rows.first).to_be_visible(timeout=20000)
        
        n = rows.count()
        if n == 0:
            raise AssertionError("No rows visible after filtering.")
        
        for i in range(min(n, 15)):  # Limit checks for speed
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
        
        return self
