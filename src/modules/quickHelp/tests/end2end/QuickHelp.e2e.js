const webdriver = require("selenium-webdriver"),
    {isMaster, isCustom} = require("../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../test/end2end/library/utils"),
    {By, until} = webdriver;

/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function QuickHelpTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isCustom(url) || isMaster(url);

    if (testIsApplicable) {
        describe("QuickHelp", function () {
            let driver, navBarIcon, quickHelp;

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

            it("clicking questionmark sign near searchbar opens quick help and click the x will close it", async () => {
                navBarIcon = await driver.findElement(By.css("div#searchbar span.glyphicon-question-sign"));
                await navBarIcon.click();

                quickHelp = await driver.wait(until.elementLocated(By.css("#quickHelp")), 1000);
                await driver.wait(until.elementIsVisible(quickHelp), 5000);
                const cross = await driver.wait(until.elementLocated(By.css("#quickHelp span.glyphicon-remove")), 1000);

                await cross.click();
                await driver.wait(
                    async () => (await driver.findElements(By.css("#quickHelp"))).length <= 0,
                    5000
                );
            });

            it("will close the quickHelp if clicking the questionmark sign twice", async () => {
                navBarIcon = await driver.findElement(By.css("div#searchbar span.glyphicon-question-sign"));
                await navBarIcon.click();

                quickHelp = await driver.wait(until.elementLocated(By.css("#quickHelp")), 1000);
                await driver.wait(until.elementIsVisible(quickHelp), 5000);
                await navBarIcon.click();
                await driver.wait(
                    async () => (await driver.findElements(By.css("#quickHelp"))).length <= 0,
                    5000
                );
            });

        });
    }
}

module.exports = QuickHelpTests;
