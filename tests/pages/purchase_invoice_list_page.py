from playwright.sync_api import Page, expect

class PurchaseInvoiceListPage:
    """Page Object for ERPNext Purchase Invoice List page"""
    
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")
        
        # Locators
        self.add_btn = 'button:has-text("Add Purchase Invoice")'
        
    def open(self):
        """Navigate to purchase invoice list"""
        self.page.goto(f"{self.base_url}/app/purchase-invoice", wait_until="domcontentloaded")
        # Sanity check
        expect(self.page.locator("text=Purchase Invoice")).to_be_visible(timeout=20000)
        return self
    
    def click_add_purchase_invoice(self):
        """Click Add Purchase Invoice button"""
        self.page.locator(self.add_btn).click()
        self.page.wait_for_load_state("domcontentloaded")
        expect(self.page.locator("text=New Purchase Invoice")).to_be_visible(timeout=20000)
        return self
