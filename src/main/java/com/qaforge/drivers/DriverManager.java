package com.qaforge.drivers;

import com.qaforge.config.ConfigManager;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

public final class DriverManager {

    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    private DriverManager() {
        // Utility class
    }

    public static WebDriver getDriver() {
        if (driver.get() == null) {
            driver.set(createDriver());
        }
        return driver.get();
    }

    private static WebDriver createDriver() {
        String browser = ConfigManager.getProperty("browser", "htmlunit").toLowerCase();

        if ("chrome" .equals(browser) || "chromium".equals(browser)) {
            WebDriverManager.chromedriver().setup();
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new");
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");

            if ("chromium".equals(browser)) {
                options.setBinary("/usr/bin/chromium-browser");
            }

            return new ChromeDriver(options);
        }

        if ("htmlunit".equals(browser)) {
            return new HtmlUnitDriver(true);
        }

        throw new IllegalStateException("Unsupported browser: " + browser);
    }

    public static void quitDriver() {
        WebDriver webDriver = driver.get();
        if (webDriver != null) {
            webDriver.quit();
            driver.remove();
        }
    }
}
