const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getResolution} = require("../../../../../../test/end2end/library/scripts"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {until, By} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function ZoomTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("Modules Controls Zoom", function () {
            let driver, minus, plus;

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


            it("should have a plus button", async function () {
                plus = await driver.wait(until.elementLocated(By.css("button.control-icon > .bi-plus-lg")), 5000);
                expect(plus).to.exist;
            });

            it("should zoom in after clicking plus button", async function () {
                const res = await driver.executeScript(getResolution);

                await plus.click();
                await driver.wait(async () => res > await driver.executeScript(getResolution), 3000, "Map did not zoom in.");
            });

            it("should have a minus button", async function () {
                minus = await driver.findElement(By.css("button.control-icon > .bi-dash-lg"));
                expect(minus).to.exist;
            });

            it("should zoom out after clicking minus button", async function () {
                const res = await driver.executeScript(getResolution);

                await minus.click();
                await driver.wait(async () => res < await driver.executeScript(getResolution), 3000, "Map did not zoom out.");
            });
        });
    }
}

module.exports = ZoomTests;
