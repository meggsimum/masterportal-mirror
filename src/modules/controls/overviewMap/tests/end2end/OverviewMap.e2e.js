const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {losesCenter, logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {getCenter} = require("../../../../../../test/end2end/library/scripts"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {until, By, Button} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function OverviewMap ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("Modules Controls OverviewMap", async function () {
            let driver, overviewMapButton, overviewMap, overviewMapViewport, overviewMapBox;

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


            it("has an overview map button", async function () {
                await driver.wait(until.elementLocated(By.css(".overviewmap-button")), 9000);
                overviewMapButton = await driver.findElement(By.css(".overviewmap-button"));

                expect(overviewMapButton).to.exist;
            });

            it("closes/opens overview map on clicking overview map button", async function () {
                // open - is closed initially in master, is open initially in custom
                if (isMaster(url)) {
                    // NOTE: next line is a crutch until control layout issues are resolved; WD won't scroll by itself
                    await driver.executeScript("window.scrollBy(0, 250);");
                    await overviewMapButton.click();
                    await driver.wait(
                        async () => (await driver.findElements(By.css(".ol-overviewmap"))).length > 0,
                        5000,
                        "OverviewMap did not open in time."
                    );
                }

                // NOTE: next line is a crutch until control layout issues are resolved; WD won't scroll by itself
                await driver.executeScript("window.scrollBy(0, 250);");

                // close and check result
                await overviewMapButton.click();
                await driver.wait(
                    async () => (await driver.findElements(By.css(".ol-overviewmap"))).length === 0,
                    5000,
                    "OverviewMap did not close in time."
                );

                // NOTE: next line is a crutch until control layout issues are resolved; WD won't scroll by itself
                await driver.executeScript("window.scrollBy(0, 250);");

                // open and check result
                await overviewMapButton.click();
                await driver.wait(
                    async () => (await driver.findElements(By.css(".ol-overviewmap"))).length > 0,
                    5000,
                    "OverviewMap did not appear in time."
                );
                overviewMap = await driver.findElement(By.css(".ol-overviewmap"));
                overviewMapViewport = await driver.findElement(By.css(".ol-overviewmap .ol-viewport"));

                expect(overviewMap).to.exist;
                expect(overviewMapViewport).to.exist;
            });

            it("allows panning the map from the overview map", async function () {
                const center = await driver.executeScript(getCenter);

                overviewMapBox = await driver.findElement(By.css(".ol-overviewmap"));

                await driver.actions({bridge: true})
                    .move({origin: overviewMapBox})
                    .press(Button.LEFT)
                    .move({origin: overviewMapBox, x: 5, y: 5})
                    .release(Button.LEFT)
                    .perform();

                expect(await losesCenter(driver, center)).to.be.true;
            });
        });
    }
}

module.exports = OverviewMap;
