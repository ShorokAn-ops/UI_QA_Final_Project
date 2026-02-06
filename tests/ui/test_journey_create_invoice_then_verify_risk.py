import os
import time
import unittest
from tests.ui.base_test import BaseUITest
from tests.ui.pages.invoices_page import InvoicesPage
from tests.ui.utils.erpnext_api import create_purchase_invoice_critical
from tests.ui.utils.backend_api import run_backend_sync
from tests.ui.utils.erpnext_api import delete_purchase_invoice

class TestERPNextToUIFlow(BaseUITest):
   
    @unittest.skipIf(os.getenv("CI"), "Skipping in CI environment - requires ERPNext backend")
    def test_invoice_appears_with_correct_risk(self):
        invoice_id = create_purchase_invoice_critical()

        try:
            run_backend_sync()

            invoices = InvoicesPage(self.page)
            invoices.open()

            # OPTIONAL: Close "Visit Site" overlay if it appears
            try:
                visit_btn = self.page.get_by_role("button", name="Visit Site")
                if visit_btn.is_visible(timeout=3000):
                    visit_btn.click()
                    self.page.wait_for_load_state("domcontentloaded")
            except Exception:
                pass

            last_error = None

            for attempt in range(1, 6):
                try:
                    invoices.expect_invoice_visible(invoice_id)
                    invoices.expect_invoice_risk_level(invoice_id, "CRITICAL")
                    self.page.wait_for_timeout(5000)

                    return  # ✅ Test passed

                except Exception as e:
                    last_error = e
                    if attempt == 5:
                        raise last_error

                    time.sleep(4)
                    self.page.reload(wait_until="domcontentloaded")
                    run_backend_sync()

        finally:
            # 🧹 TEARDOWN: delete invoice from ERPNext
            try:
                delete_purchase_invoice(invoice_id)
            except Exception as e:
                print(f"WARNING: failed to delete invoice {invoice_id}: {e}")


if __name__ == "__main__":
    unittest.main()