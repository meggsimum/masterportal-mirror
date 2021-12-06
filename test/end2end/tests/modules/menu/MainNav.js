/* eslint-disable one-var */

const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isMaster} = require("../../../settings"),
    {By, until, Key} = webdriver;


/**
 * Tests regarding menu navigation.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function MainNavTests ({builder, url, resolution, capability}) {
    describe("Main Menu", async function () {
        let driver;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await getDriver();
        });

        after(async function () {
            if (capability) {
                driver.session_.then(function (sessionData) {
                    logTestingCloudUrlToTest(sessionData.id_);
                });
            }
        });

        afterEach(async function () {
            if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
                await quitDriver();
                driver = await initDriver(builder, url, resolution);
            }
        });

        if (isMaster(url)) {

            it("allows navigation by tab to the tool menu", async function () {

                await (await driver.wait(
                    until.elementLocated(By.css("ul#root li:first-child")),
                    12000,
                    "navigation bar did not appear"
                )).click();

                // close menu
                await driver.switchTo().activeElement().sendKeys(Key.ESCAPE);

                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                // open tools menu
                await driver.switchTo().activeElement().sendKeys(Key.ENTER);

                await driver.wait(until.elementLocated(By.css("ul#tools>li>a")));
            });

            it("allows navigation by tab to the first control button", async function () {

                await (await driver.wait(
                    until.elementLocated(By.css("ul#root li:first-child")),
                    12000,
                    "navigation bar did not appear"
                )).click();

                // close menu
                await driver.switchTo().activeElement().sendKeys(Key.ESCAPE);

                // navigate to fullscreen button
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);

                const attribs = await driver.switchTo().activeElement().getAttribute("class");

                expect(attribs.includes("bi-arrows-angle-expand")).to.be.true;
            });
        }
    });
}

module.exports = MainNavTests;
