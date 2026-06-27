package com.qaforge.tests;

import com.qaforge.drivers.DriverManager;
import com.qaforge.utilities.LoggerUtil;
import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

public abstract class BaseTest {

    protected WebDriver driver;

    @BeforeClass
    public void setUp() {
        driver = DriverManager.getDriver();
        LoggerUtil.info("Driver initialized.");
    }

    @AfterClass
    public void tearDown() {
        DriverManager.quitDriver();
        LoggerUtil.info("Driver quit.");
    }
}
