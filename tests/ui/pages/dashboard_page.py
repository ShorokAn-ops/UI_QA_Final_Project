from playwright.sync_api import Page, expect
from tests.ui.pages.base_page import BasePage

class DashboardPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def open(self):
        self.goto("/")
        expect(self.page.get_by_role("heading", name="ERPNext Anomalous Analyzer")).to_be_visible(timeout=30_000)
        return self

    def click_risk_card(self, label: str):
        """
        label examples: "Low Risk" | "Medium Risk" | "High Risk" | "Critical"
        Based on your RiskChart cards being clickable.
        """
        clickable = self.page.locator("div.cursor-pointer", has_text=label).first
        expect(clickable).to_be_visible(timeout=20_000)
        clickable.click()
