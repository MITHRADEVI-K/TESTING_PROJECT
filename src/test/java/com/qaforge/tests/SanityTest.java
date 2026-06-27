package com.qaforge.tests;

import com.qaforge.config.ConfigManager;
import com.qaforge.pages.HomePage;
import com.qaforge.tests.BaseTest;
import com.qaforge.utilities.LoggerUtil;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SanityTest extends BaseTest {

    @Test(description = "Verify that the base URL is reachable and the page loads")
    public void verifyBaseUrl() {
        String baseUrl = ConfigManager.getProperty("baseUrl");
        LoggerUtil.info("Navigating to " + baseUrl);
        driver.get(baseUrl);

        HomePage homePage = new HomePage(driver);
        String title = homePage.getPageTitle();
        String heading = homePage.getHeadingText();

        LoggerUtil.info("Page title is: " + title);
        LoggerUtil.info("Heading text is: " + heading);

        Assert.assertNotNull(title, "Expected the page title to be present.");
        Assert.assertTrue(heading.length() > 0, "Expected the page heading to be visible.");
    }
}
