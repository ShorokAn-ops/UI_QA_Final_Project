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

    def assert_risk_filter_selected(self, expected_level: str):
        """
        Assert that the risk filter dropdown has the expected value selected.
        
        Args:
            expected_level: Risk level - "Critical" | "High Risk" | "Medium Risk" | "Low Risk" | "All Risk Levels"
        """
        filter_dropdown = self.page.locator("select#risk-filter")
        expect(filter_dropdown).to_be_visible(timeout=10_000)
        
        # Map friendly names to select option values
        level_map = {
            "Critical": "CRITICAL",
            "High Risk": "HIGH",
            "Medium Risk": "MEDIUM",
            "Low Risk": "LOW",
            "All Risk Levels": "ALL"
        }
        
        expected_value = level_map.get(expected_level, expected_level)
        expect(filter_dropdown).to_have_value(expected_value, timeout=10_000)

    def assert_filtered_badge_visible(self, risk_label: str):
        """
        Assert that the "Filtered: {risk_label}" badge is visible.
        
        Args:
            risk_label: The risk label that should appear in the badge, e.g., "Critical"
        """
        badge_text = f"Filtered: {risk_label}"
        badge = self.page.get_by_text(badge_text, exact=True)
        expect(badge).to_be_visible(timeout=10_000)

    def assert_all_rows_match_risk(self, risk_level: str):
        """
        Assert that all visible invoice rows have the specified risk level.
        
        Args:
            risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
        """
        # Wait for table to load
        self.page.wait_for_selector("tbody tr", timeout=30_000)
        
        rows = self.page.locator("tbody tr")
        row_count = rows.count()
        
        assert row_count > 0, "No invoice rows found in the table"
        
        # Check each row contains the expected risk level
        for i in range(row_count):
            row = rows.nth(i)
            # The risk level appears as capitalized text in the row
            risk_cell = row.get_by_text(risk_level.capitalize(), exact=False)
            expect(risk_cell).to_be_visible(timeout=10_000)

    def wait_for_url_contains(self, text: str):
        """
        Wait for the URL to contain a specific text.
        
        Args:
            text: The text that should be in the URL (e.g., "risk_level=CRITICAL")
        """
        self.page.wait_for_url(f"**/*{text}*", timeout=10_000)

    def get_visible_row_count(self) -> int:
        """
        Get the number of visible invoice rows in the table.
        
        Returns:
            The count of visible rows
        """
        self.page.wait_for_selector("tbody tr", timeout=30_000)
        rows = self.page.locator("tbody tr")
        return rows.count()
