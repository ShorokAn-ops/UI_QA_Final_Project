# TEST 1: JOURNEY (end-to-end across ERPNext -> Risk UI)
#
# Plan:
# 1. Setup browser and environment variables (ERPNext URL, Risk UI URL, credentials)
# 2. Navigate to ERPNext Purchase Invoice list
# 3. Login if required
# 4. Create new Purchase Invoice with:
#    - Company: "Demo Company"
#    - Supplier: "NovaTech Trading"
#    - Item: "Office Supplies", Qty: 30, Rate: 10000
# 5. Save (not submit) and capture invoice ID from URL
# 6. Navigate to Risk UI invoices page
# 7. Wait for invoice to appear in table
# 8. Assert supplier, risk level, and reasons
# 9. Open "+X more" modal and verify AI insights present

import os
import unittest
from playwright.sync_api import sync_playwright, expect

from tests.pages.erpnext_login_page import ERPNextLoginPage
from tests.pages.purchase_invoice_list_page import PurchaseInvoiceListPage
from tests.pages.purchase_invoice_form_page import PurchaseInvoiceFormPage
from tests.pages.risk_ui_invoices_page import RiskUIInvoicesPage


class TestJourney_CreateInvoiceThenVerifyRisk(unittest.TestCase):
    """
    End-to-end test: Create invoice in ERPNext, verify risk analysis in Risk UI
    """
    
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        
        # Use HEADLESS env var (default 0 = visible)
        headless = os.getenv("HEADLESS", "0") == "1"
        cls.browser = cls.playwright.chromium.launch(headless=headless)
        
        # Environment variables
        cls.ERPNEXT_URL = os.getenv("ERPNEXT_URL", "http://localhost:8080")
        cls.RISK_UI_URL = os.getenv("RISK_UI_URL", "http://localhost:3001")
        cls.ERPNEXT_USER = os.getenv("ERPNEXT_USER", "Administrator")
        cls.ERPNEXT_PASS = os.getenv("ERPNEXT_PASS", "admin")
        
        # Test scenario data
        cls.COMPANY = "Demo Company"
        cls.SUPPLIER = "NovaTech Trading"
        cls.ITEM = "Office Supplies"
        cls.QTY = 30
        cls.RATE = 10000
        
        # Expected results (adjust based on current backend rules)
        # For qty=30 & rate=10000, backend should produce HIGH or CRITICAL
        cls.EXPECTED_RISK = "High Risk"  # Display label
    
    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
    
    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
    
    def tearDown(self):
        self.context.close()
    
    def test_e2e_create_invoice_then_verify_risk_ui(self):
        """
        Scenario:
        1) Login to ERPNext
        2) Create Purchase Invoice (save as draft)
        3) Verify invoice appears in Risk UI with correct risk and reasons
        """
        
        # STEP 1: Login to ERPNext
        login_page = ERPNextLoginPage(self.page, self.ERPNEXT_URL)
        login_page.open().login(self.ERPNEXT_USER, self.ERPNEXT_PASS)
        
        # STEP 2: Navigate to Purchase Invoice list
        list_page = PurchaseInvoiceListPage(self.page, self.ERPNEXT_URL)
        list_page.open().click_add_purchase_invoice()
        
        # STEP 3: Fill invoice form
        form_page = PurchaseInvoiceFormPage(self.page, self.ERPNEXT_URL)
        form_page.fill_company(self.COMPANY)
        form_page.fill_supplier(self.SUPPLIER)
        form_page.fill_item_row(self.ITEM, self.QTY, self.RATE)
        
        # STEP 4: Save and capture invoice ID
        invoice_id = form_page.save_and_get_invoice_id()
        self.assertTrue(invoice_id.startswith("ACC-PINV-"), f"Unexpected invoice_id: {invoice_id}")
        print(f"Created invoice: {invoice_id}")
        
        # STEP 5: Navigate to Risk UI
        risk_page = RiskUIInvoicesPage(self.page, self.RISK_UI_URL)
        risk_page.open()
        
        # STEP 6: Wait for invoice to appear (backend polling)
        risk_page.wait_for_invoice(invoice_id, timeout_ms=60000)
        
        # STEP 7: Get row and assert supplier
        row = risk_page.get_row_by_invoice_id(invoice_id)
        row_text = row.inner_text()
        self.assertIn(self.SUPPLIER, row_text, f"Supplier '{self.SUPPLIER}' not found in row")
        
        # STEP 8: Assert risk level
        risk_page.assert_row_risk(row, self.EXPECTED_RISK)
        
        # STEP 9: Open reasons modal and verify
        risk_page.open_more_reasons_for_row(row)
        
        # Assert modal has key elements
        modal_text = risk_page.read_modal_reasons_text()
        
        # Check modal contains "Risk Analysis Details" and "All Reasons"
        self.assertIn("Risk Analysis Details", modal_text)
        self.assertIn("All Reasons", modal_text)
        
        # Assert at least one reason related to quantity/unit price
        # (adjust expected text based on your backend's actual AI insights)
        has_qty_reason = (
            "high quantity" in modal_text.lower() or
            "notable quantity" in modal_text.lower() or
            "quantity" in modal_text.lower()
        )
        has_price_reason = (
            "high unit price" in modal_text.lower() or
            "unit price" in modal_text.lower() or
            "price" in modal_text.lower()
        )
        
        self.assertTrue(
            has_qty_reason or has_price_reason,
            f"Expected reason about quantity or price not found in modal. Modal text:\n{modal_text}"
        )
        
        # STEP 10: Assert AI insights present
        risk_page.assert_modal_has_ai_insights()
        
        print(f"Test passed for invoice {invoice_id}")


if __name__ == "__main__":
    unittest.main()
