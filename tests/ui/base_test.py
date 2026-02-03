import os
import unittest
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page

load_dotenv()

class BaseUITest(unittest.TestCase):
    UI_BASE_URL = os.getenv("UI_BASE_URL", "http://localhost:3001")
    HEADLESS = os.getenv("HEADLESS", "1") == "1"

    # חדש: בוחרים דפדפן דרך env
    # ערכים מומלצים: "chromium" | "chrome" | "msedge"
    BROWSER_CHANNEL = os.getenv("BROWSER_CHANNEL", "chromium").lower()

    @classmethod
    def setUpClass(cls) -> None:
        cls._playwright = sync_playwright().start()

        chromium = cls._playwright.chromium

        # ברירת מחדל: Chromium של Playwright
        if cls.BROWSER_CHANNEL == "chromium":
            cls._browser = chromium.launch(headless=cls.HEADLESS)
        # Chrome מותקן במערכת (channel)
        elif cls.BROWSER_CHANNEL == "chrome":
            cls._browser = chromium.launch(channel="chrome", headless=cls.HEADLESS)
        # Microsoft Edge מותקן במערכת (channel)
        elif cls.BROWSER_CHANNEL in ("edge", "msedge"):
            cls._browser = chromium.launch(channel="msedge", headless=cls.HEADLESS)
        else:
            raise RuntimeError(
                f"Unknown BROWSER_CHANNEL='{cls.BROWSER_CHANNEL}'. "
                "Use: chromium | chrome | msedge"
            )

    @classmethod
    def tearDownClass(cls) -> None:
        cls._browser.close()
        cls._playwright.stop()

    def setUp(self) -> None:
        self.context: BrowserContext = self._browser.new_context(base_url=self.UI_BASE_URL)
        self.page: Page = self.context.new_page()

    def tearDown(self) -> None:
        self.page.close()
        self.context.close()
