const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getCenter} = require("../../../../../../test/end2end/library/scripts"),
    {onMoveEnd} = require("../../../../../../test/end2end/library/scriptsAsync"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {isMaster, isFirefox} = require("../../../../../../test/end2end/settings"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {until, By} = webdriver;

/**
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {String} params.browsername the name of the browser
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
function BackForwardTests ({builder, url, resolution, capability, browsername}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("Modules Controls BackForward", function () {
            let driver, forwardButton, backwardButton;

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


            it("should provide the forward and backward button", async function () {
                await driver.wait(until.elementLocated(By.css(".back-forward-buttons .forward")), 50000);
                forwardButton = driver.findElement(By.css(".back-forward-buttons .forward"));
                backwardButton = driver.findElement(By.css(".back-forward-buttons .backward"));

                expect(forwardButton).to.exist;
                expect(backwardButton).to.exist;
            });

            // canvas panning is currently broken in Chrome, see https://github.com/SeleniumHQ/selenium/issues/6332
            (isFirefox(browsername) ? it : it.skip)("should move forwards/backwards after panning on button click", async function () {
                const viewport = await driver.findElement(By.css(".ol-viewport")),
                    positions = [];

                /**
                 * Encapsulate all steps necessary for panning.
                 * @returns {void}
                 */
                async function pan () {
                    await driver.actions({bridge: true})
                        .dragAndDrop(viewport, {x: 10, y: 10})
                        .perform();

                    await driver.executeAsyncScript(onMoveEnd);

                    positions.push(await driver.executeScript(getCenter));
                }

                positions.push(await driver.executeScript(getCenter));
                await pan();
                await pan();
                await pan();

                expect(positions[0]).not.to.eql(positions[1]);
                expect(positions[1]).not.to.eql(positions[2]);
                expect(positions[2]).not.to.eql(positions[3]);
                expect(positions[3]).to.eql(await driver.executeScript(getCenter));

                // wait for information to trickle through to back button functionality ...
                await new Promise(resolve => setTimeout(resolve, 1000));

                // move backwards
                await backwardButton.click();
                expect(positions[2]).to.eql(await driver.executeScript(getCenter));
                await backwardButton.click();
                expect(positions[1]).to.eql(await driver.executeScript(getCenter));
                await backwardButton.click();
                expect(positions[0]).to.eql(await driver.executeScript(getCenter));

                // move forwards
                await forwardButton.click();
                expect(positions[1]).to.eql(await driver.executeScript(getCenter));
                await forwardButton.click();
                expect(positions[2]).to.eql(await driver.executeScript(getCenter));
                await forwardButton.click();
                expect(positions[3]).to.eql(await driver.executeScript(getCenter));
            });
        });
    }
}

module.exports = BackForwardTests;
