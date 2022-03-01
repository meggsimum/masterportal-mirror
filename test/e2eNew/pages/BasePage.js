// filename: pages/BasePage.js
const config = require("../lib/config");
const {isInitalLoadingFinished} = require("../lib/scripts"),
    Until = require("selenium-webdriver").until;

/**
     * todo
     * @returns {void}
     */
class BasePage {
    /**
     * todo
     *  @param {*} driver -
     * @returns {void}
     */
    constructor (driver) {
        this.driver = driver;
    }

    /**
     * todo
     * @param {*} url -
     * @returns {void}
     */
    async visit (url) {
        if (url.startsWith("http")) {
            await this.driver.get(url);
        }
        else {
            await this.driver.get(config.baseUrl + url);
        }
    }
    /**
     * todo
     * @param {*} subPage -
     * @returns {void}
     */
    async load (subPage = "") {
        await this.visit(subPage);
        await this.driver.wait(async () => await this.driver.executeScript(isInitalLoadingFinished) === true, 90000)
            .catch(err => {
                console.warn("isInitalLoadingFinished err:", err);
            });
    }

    /**
     * todo
     * @param {*} locator -
     * @returns {*} -
     */
    find (locator) {
        return this.driver.findElement(locator);
    }

    /**
     * todo
     * @param {*} locator -
     * @returns {*} -
     */
    async click (locator) {
        await this.find(locator).click();
    }

    /**
     * todo
     * @param {*} locator -
     * @param {*} inputText -
     * @returns  {*} -
     */
    async type (locator, inputText) {
        await this.find(locator).sendKeys(inputText);
    }

    /**
     * todo
     * @param {*} locator -
     * @param {*} timeout -
     * @returns  {*} -
     */
    async isDisplayed (locator, timeout) {
        if (timeout) {
            await this.driver.wait(Until.elementLocated(locator), timeout);
            await this.driver.wait(
                Until.elementIsVisible(this.find(locator)),
                timeout
            );
            return true;
        }

        try {
            return await this.find(locator).isDisplayed();
        }
        catch (error) {
            console.error(error);
            return false;
        }

    }

}

module.exports = BasePage;
