const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {until, By} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function AttributionsTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("Modules Controls Attributions", async function () {
            let driver, attributionsButton, attributionsDiv;

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


            it("should have an attributions button", async function () {
                await driver.wait(until.elementLocated(By.css(".attributions-button")), 12000);
                attributionsButton = await driver.findElement(By.css(".attributions-button"));

                expect(attributionsButton).to.exist;
            });

            it("should open/close closed/opened attributions on clicking attribution button", async function () {
                attributionsButton = await driver.findElement(By.css(".attributions-button"));
                await attributionsButton.click();
                expect((await driver.findElements(By.css(".attributions-div"))).length).to.equal(0);
                await attributionsButton.click();
                attributionsDiv = await driver.findElement(By.css(".attributions-view"));
                expect(attributionsDiv).to.exist;
            });

            it("should have attributions text 'Attributierung für Fachlayer'", async function () {
                const attributionsHeader = await driver.findElement(By.xpath("//dt[contains(.,'Krankenhäuser:')]")),
                    attributionsText = await driver.findElement(By.xpath("//dd/span[contains(.,'Attributierung für Fachlayer')]"));

                expect(attributionsHeader).to.exist;
                expect(attributionsText).to.exist;
            });
        });
    }
}

module.exports = AttributionsTests;
