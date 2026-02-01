from playwright.sync_api import Page, expect
from tests.ui.pages.base_page import BasePage


class InvoicesPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def open(self, risk_level: str | None = None):
        url = "/invoices"
        if risk_level:
            url += f"?risk_level={risk_level}"
        self.goto(url)

        expect(
            self.page.get_by_role("heading", name="Invoices").first
        ).to_be_visible(timeout=30_000)

        expect(self.page.get_by_text("INVOICE ID")).to_be_visible(timeout=30_000)
        return self

    def row_by_invoice_id(self, invoice_id: str):
        return self.page.locator("tbody tr", has_text=invoice_id).first

    def expect_invoice_visible(self, invoice_id: str):
        row = self.row_by_invoice_id(invoice_id)
        expect(row).to_be_visible(timeout=45_000)

    def expect_invoice_risk_level(self, invoice_id: str, expected_level: str):
        """
        expected_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
        """
        row = self.row_by_invoice_id(invoice_id)
        expect(row).to_be_visible(timeout=45_000)

        # Risk level cell (contains "Critical 100.0%")
        risk_cell = row.get_by_text(expected_level.capitalize(), exact=False)
        expect(risk_cell).to_be_visible(timeout=45_000)

    def expect_all_rows_risk_level(self, expected_level: str):
        rows = self.page.locator("tbody tr")
        for i in range(rows.count()):
            row = rows.nth(i)
            expect(
                row.get_by_text(expected_level.capitalize(), exact=False)
            ).to_be_visible(timeout=20_000)
