from playwright.sync_api import Page, expect

class ERPNextPurchaseInvoicePage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip("/")

        # List page
        self.add_btn = 'button:has-text("Add Purchase Invoice")'

        # New doc page
        self.save_btn = 'button:has-text("Save")'

        # Header fields (ERPNext uses data-fieldname)
        self.company_input = '[data-fieldname="company"] input'
        self.supplier_input = '[data-fieldname="supplier"] input'

        # Items area
        self.items_add_row_btn = 'button:has-text("Add Row")'
        # Grid editors often appear as inputs inside row; we use "last" to target newest row
        self.item_code_input = '[data-fieldname="item_code"] input'
        # In your UI it says "Accepted Qty", but backend field might still be qty/accepted_qty
        self.accepted_qty_input = '[data-fieldname="accepted_qty"] input, [data-fieldname="qty"] input'
        self.rate_input = '[data-fieldname="rate"] input'

    def open_list(self):
        self.page.goto(f"{self.base_url}/app/purchase-invoice")
        self.page.wait_for_load_state("domcontentloaded")
        # sanity
        expect(self.page.locator("text=Purchase Invoice")).to_be_visible(timeout=20000)
        return self

    def click_add_purchase_invoice(self):
        self.page.locator(self.add_btn).click()
        self.page.wait_for_load_state("domcontentloaded")
        expect(self.page.locator("text=New Purchase Invoice")).to_be_visible(timeout=20000)
        return self

    def set_company(self, company: str):
        c = self.page.locator(self.company_input).first
        c.click()
        c.fill(company)
        self.page.keyboard.press("Enter")
        return self

    def set_supplier(self, supplier: str):
        s = self.page.locator(self.supplier_input).first
        s.click()
        s.fill(supplier)
        self.page.keyboard.press("Enter")
        return self

    def add_item_row(self, item_name: str, accepted_qty: float, rate: float):
        # Click "Add Row"
        self.page.locator(self.items_add_row_btn).click()

        # Fill last row inputs
        self.page.locator(self.item_code_input).last.click()
        self.page.locator(self.item_code_input).last.fill(item_name)
        self.page.keyboard.press("Enter")

        self.page.locator(self.accepted_qty_input).last.click()
        self.page.locator(self.accepted_qty_input).last.fill(str(accepted_qty))

        self.page.locator(self.rate_input).last.click()
        self.page.locator(self.rate_input).last.fill(str(rate))

        return self

    def save_and_get_invoice_id(self) -> str:
        self.page.locator(self.save_btn).click()

        # After Save you showed URL:
        # http://localhost:8080/app/purchase-invoice/ACC-PINV-2026-00047
        self.page.wait_for_url("**/app/purchase-invoice/ACC-PINV-*", timeout=30000)

        invoice_id = self.page.url.split("/app/purchase-invoice/")[1].split("?")[0].strip("/")
        if not invoice_id.startswith("ACC-PINV-"):
            raise AssertionError(f"Unexpected invoice_id parsed from URL: {invoice_id}")

        return invoice_id
