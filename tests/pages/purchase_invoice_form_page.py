from playwright.sync_api import Page, expect

class PurchaseInvoiceFormPage:
    """Page Object for ERPNext Purchase Invoice Form (new/edit)"""
    
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")
        
        # Locators - Header fields
        self.company_input = '[data-fieldname="company"] input'
        self.supplier_input = '[data-fieldname="supplier"] input'
        
        # Items area
        self.items_add_row_btn = 'button:has-text("Add Row")'
        self.item_code_input = '[data-fieldname="item_code"] input'
        self.accepted_qty_input = '[data-fieldname="accepted_qty"] input, [data-fieldname="qty"] input'
        self.rate_input = '[data-fieldname="rate"] input'
        
        # Actions
        self.save_btn = 'button:has-text("Save")'
        
    def fill_company(self, company: str):
        """Fill company field"""
        c = self.page.locator(self.company_input).first
        c.click()
        c.fill(company)
        self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(500)  # Small debounce for autocomplete
        return self
    
    def fill_supplier(self, supplier: str):
        """Fill supplier field"""
        s = self.page.locator(self.supplier_input).first
        s.click()
        s.fill(supplier)
        self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(500)  # Small debounce for autocomplete
        return self
    
    def fill_item_row(self, item_name: str, qty: float, rate: float):
        """Add and fill an item row"""
        # Click "Add Row"
        self.page.locator(self.items_add_row_btn).click()
        self.page.wait_for_timeout(300)
        
        # Fill last row inputs
        self.page.locator(self.item_code_input).last.click()
        self.page.locator(self.item_code_input).last.fill(item_name)
        self.page.keyboard.press("Enter")
        self.page.wait_for_timeout(500)
        
        self.page.locator(self.accepted_qty_input).last.click()
        self.page.locator(self.accepted_qty_input).last.fill(str(qty))
        self.page.wait_for_timeout(300)
        
        self.page.locator(self.rate_input).last.click()
        self.page.locator(self.rate_input).last.fill(str(rate))
        self.page.wait_for_timeout(300)
        
        return self
    
    def save_and_get_invoice_id(self) -> str:
        """
        Click Save and extract invoice ID from URL
        Returns: Invoice ID like ACC-PINV-2026-00047
        """
        self.page.locator(self.save_btn).click()
        
        # After Save, URL becomes: http://localhost:8080/app/purchase-invoice/ACC-PINV-2026-00047
        self.page.wait_for_url("**/app/purchase-invoice/ACC-PINV-*", timeout=30000)
        
        invoice_id = self.page.url.split("/app/purchase-invoice/")[1].split("?")[0].strip("/")
        if not invoice_id.startswith("ACC-PINV-"):
            raise AssertionError(f"Unexpected invoice_id parsed from URL: {invoice_id}")
        
        return invoice_id
