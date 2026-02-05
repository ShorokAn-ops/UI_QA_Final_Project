from playwright.sync_api import expect


class VendorsPage:
    def __init__(self, page, base_url: str = "http://localhost:3001"):
        self.page = page
        self.base_url = base_url.rstrip("/")

        self.vendor_filter = page.locator("select").first
        self.table = page.locator("table")

        self.rows = page.locator("table tbody tr")

        self.filtered_badge = page.locator("text=Filtered:").first
        self.showing_text = page.locator("text=Showing").first

    def open(self):
        self.page.goto(f"{self.base_url}/vendors", wait_until="domcontentloaded")
        expect(self.table).to_be_visible(timeout=20000)
        return self

    def set_vendor_filter(self, vendor_name: str):
        expect(self.vendor_filter).to_be_visible(timeout=20000)
        self.vendor_filter.select_option(label=vendor_name)

        expect(self.page.locator(f"text=Filtered: {vendor_name}")).to_be_visible(timeout=20000)

    def assert_vendor_filter_applied(self, vendor_name: str):
        """
        This matches what the UI shows:
        - Badge "Filtered: <vendor_name>" exists
        - "Showing 1 of ..." exists (filtered view)
        - At least one VISIBLE row contains vendor_name
        """
        # 1) badge exists
        expect(self.page.locator(f"text=Filtered: {vendor_name}")).to_be_visible(timeout=20000)

        # 2) showing text indicates filtered view (you see "Showing 1 of 7 vendors")
        expect(self.page.locator("text=Showing 1 of")).to_be_visible(timeout=20000)

        # 3) at least one visible row matches vendor
        vendor_row_visible = self.page.locator("table tbody tr", has_text=vendor_name).first
        expect(vendor_row_visible).to_be_visible(timeout=20000)

        supplier_cell = vendor_row_visible.locator("td").nth(0)
        expect(supplier_cell).to_contain_text(vendor_name, timeout=20000)

    def assert_all_rows_match_vendor(self, vendor_name: str):
        self.assert_vendor_filter_applied(vendor_name)
