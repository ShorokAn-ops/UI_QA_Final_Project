import os
import unittest
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

# Load .env from project root
load_dotenv()


class BaseUITest(unittest.TestCase):
    """
    Base class for Playwright UI tests (NO pytest fixtures).
    One browser per test class, fresh context+page per test.
    """

    UI_BASE_URL = os.getenv("UI_BASE_URL", "http://localhost:3001")
    HEADLESS = os.getenv("HEADLESS", "1") == "1"

    @classmethod
    def setUpClass(cls) -> None:
        cls._playwright = sync_playwright().start()
        cls._browser: Browser = cls._playwright.chromium.launch(
            headless=cls.HEADLESS
        )

    @classmethod
    def tearDownClass(cls) -> None:
        cls._browser.close()
        cls._playwright.stop()

    def setUp(self) -> None:
        self.context: BrowserContext = self._browser.new_context(
            base_url=self.UI_BASE_URL
        )
        self.page: Page = self.context.new_page()

    def tearDown(self) -> None:
        self.page.close()
        self.context.close()
