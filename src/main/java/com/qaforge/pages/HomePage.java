package com.qaforge.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class HomePage extends BasePage {

    @FindBy(tagName = "h1")
    private WebElement heading;

    public HomePage(WebDriver driver) {
        super(driver);
    }

    public String getHeadingText() {
        return heading.getText();
    }
}
