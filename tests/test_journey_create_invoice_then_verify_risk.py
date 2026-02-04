import time
import unittest
from tests.ui.base_test import BaseUITest
from tests.ui.pages.invoices_page import InvoicesPage
from tests.ui.utils.erpnext_api import create_purchase_invoice_critical
from tests.ui.utils.backend_api import run_backend_sync


class TestERPNextToUIFlow(BaseUITest):
    def test_invoice_appears_with_correct_risk(self):
        invoice_id = create_purchase_invoice_critical()

        run_backend_sync()

        invoices = InvoicesPage(self.page)
        invoices.open()

        last_error = None

        for attempt in range(1, 6):
            try:
                invoices.expect_invoice_visible(invoice_id)
                invoices.expect_invoice_risk_level(invoice_id, "CRITICAL")
                self.page.wait_for_timeout(60000)  # wait 60 seconds to observe the result

                return  # Test passed

            except Exception as e:
                last_error = e
                if attempt == 5:
                    raise last_error

                time.sleep(5)

                self.page.reload(wait_until="domcontentloaded")

                run_backend_sync()



if __name__ == "__main__":
    unittest.main()
