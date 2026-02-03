import unittest
from tests.ui.base_test import BaseUITest
from tests.ui.pages.vendors_page import VendorsPage


class TestVendorsFilter(BaseUITest):
    def test_filter_by_vendor_name_shows_correct_rows(self):
        vendor_name = "NovaTech Trading"

        ui = VendorsPage(self.page).open()
        ui.set_vendor_filter(vendor_name)

        ui.assert_all_rows_match_vendor(vendor_name)


if __name__ == "__main__":
    unittest.main()
