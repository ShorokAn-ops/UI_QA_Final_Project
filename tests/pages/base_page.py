from playwright.sync_api import Page

class BasePage:
    def __init__(self, page: Page):
        self.page = page

    def wait_dom_ready(self):
        self.page.wait_for_load_state("domcontentloaded")

    def wait_network_idle(self):
        self.page.wait_for_load_state("networkidle")
