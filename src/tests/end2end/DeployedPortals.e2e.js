const {expect} = require("chai"),
    {logTestingCloudUrlToTest} = require("../../../test/end2end/library/utils"),
    {initDriver, getDriver, quitDriver} = require("../../../test/end2end/library/driver");

/**
 * Tests a portal only for running.
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
async function DeployedPortalsTest ({builder, url, resolution, capability}) {
    describe("Testing a portal only for running.", function () {
        let driver;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await getDriver(builder, url, resolution);
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
                console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                await quitDriver();
                driver = await initDriver(builder, url, resolution);
            }
        });

        it("running", async function () {
            // only here for testing init driver and load url
            expect("masterportal").to.be.equals("masterportal");
        });
    });
}

module.exports = DeployedPortalsTest;
