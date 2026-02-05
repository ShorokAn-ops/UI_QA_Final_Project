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

    def click_risk_distribution(self, label: str):
        """
        Click on a risk level in the Risk Distribution chart.
        This method clicks on the clickable card below the bar chart.
        
        Args:
            label: Risk level label - "Low Risk" | "Medium Risk" | "High Risk" | "Critical"
        """
        # Wait for chart to be visible (use .first to avoid strict mode violation)
        expect(self.page.get_by_role("heading", name="Risk Distribution").first).to_be_visible(timeout=30_000)
        
        # Click on the card (easier to target than the bar itself)
        # The cards have cursor-pointer class and contain the label text
        risk_card = self.page.locator("div.cursor-pointer", has_text=label).first
        expect(risk_card).to_be_visible(timeout=20_000)
        risk_card.click()

    def get_risk_count(self, label: str) -> int:
        """
        Get the count displayed for a specific risk level.
        
        Args:
            label: Risk level label - "Low Risk" | "Medium Risk" | "High Risk" | "Critical"
        
        Returns:
            The count as an integer
        """
        risk_card = self.page.locator("div.cursor-pointer", has_text=label).first
        expect(risk_card).to_be_visible(timeout=20_000)
        
        # The count is in a div with font-extrabold class (text-3xl)
        count_element = risk_card.locator("div.font-extrabold").first
        expect(count_element).to_be_visible(timeout=10_000)
        count_text = count_element.text_content()
        return int(count_text.strip())
