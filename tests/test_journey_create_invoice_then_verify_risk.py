import time
import unittest
import pytest
import allure
from allure import severity_level
from tests.ui.base_test import BaseUITest
from tests.ui.pages.invoices_page import InvoicesPage
from tests.ui.utils.erpnext_api import create_purchase_invoice_critical
from tests.ui.utils.backend_api import run_backend_sync


@pytest.mark.erpnext_integration
class TestERPNextToUIFlow(BaseUITest):
    @allure.title("Create invoice in ERPNext and verify it appears with CRITICAL risk level")
    @allure.severity(severity_level.CRITICAL)
    @allure.description("End-to-end test: Creates a purchase invoice in ERPNext backend, syncs data, and verifies the invoice appears in the UI with correct CRITICAL risk level")
    def test_invoice_appears_with_correct_risk(self):
        with allure.step("Create purchase invoice in ERPNext with CRITICAL risk factors"):
            invoice_id = create_purchase_invoice_critical()
            allure.attach(invoice_id, name="Invoice ID", attachment_type=allure.attachment_type.TEXT)

        with allure.step("Trigger backend sync to import ERPNext data"):
            run_backend_sync()

        with allure.step("Navigate to Invoices page"):
            invoices = InvoicesPage(self.page)
            invoices.open()

        last_error = None

        for attempt in range(1, 6):
            try:
                with allure.step(f"Attempt {attempt}/5: Verify invoice appears with correct risk level"):
                    invoices.expect_invoice_visible(invoice_id)
                    invoices.expect_invoice_risk_level(invoice_id, "CRITICAL")
                    self.page.wait_for_timeout(3000)  # wait 3 seconds to observe the result

                return  # Test passed

            except Exception as e:
                last_error = e
                if attempt == 5:
                    allure.attach(self.page.url, name="Page URL on Failure", attachment_type=allure.attachment_type.TEXT)
                    raise last_error

                time.sleep(5)

                self.page.reload(wait_until="domcontentloaded")

                run_backend_sync()



if __name__ == "__main__":
    unittest.main()
