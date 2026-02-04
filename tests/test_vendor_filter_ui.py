import unittest
import allure
from allure import severity_level
from tests.ui.base_test import BaseUITest
from tests.ui.pages.vendors_page import VendorsPage


class TestVendorsFilter(BaseUITest):
    @allure.title("Filter vendors by name and verify only matching rows are displayed")
    @allure.severity(severity_level.NORMAL)
    @allure.description("Tests the vendor filter dropdown functionality: selects a specific vendor and verifies that only matching rows are shown in the table")
    def test_filter_by_vendor_name_shows_correct_rows(self):
        vendor_name = "NovaTech Trading"

        with allure.step(f"Navigate to Vendors page"):
            ui = VendorsPage(self.page).open()
        
        with allure.step(f"Apply filter for vendor: {vendor_name}"):
            ui.set_vendor_filter(vendor_name)
            allure.attach(vendor_name, name="Selected Vendor", attachment_type=allure.attachment_type.TEXT)

        with allure.step(f"Verify all visible rows match vendor: {vendor_name}"):
            ui.assert_all_rows_match_vendor(vendor_name)


if __name__ == "__main__":
    unittest.main()
