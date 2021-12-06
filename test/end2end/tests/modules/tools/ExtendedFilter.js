const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {areAllFeaturesOfLayerVisible} = require("../../../library/scripts"),
    {logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isMobile, isMaster} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding extended filter tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ExtendedFilterTests ({builder, url, resolution, capability}) {
    if (isMaster(url) && !isMobile(resolution)) {
        describe("Extended Filter", function () {
            let driver, dropdown, options, removeButton;

            /**
             * @returns {void} updates options of dropdown
             */
            async function updateInteractionElements () {
                dropdown = await driver.findElement(By.css("#dropdown"));
                await driver.wait(
                    until.elementIsVisible(dropdown),
                    5000,
                    "#dropdown select did not become visible"
                );
                options = await driver.findElements(By.css("#dropdown option"));
            }

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


            it("tool opens with select box for filter creation", async function () {
                await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                await (await driver.findElement(By.css("#tools .bi-funnel-fill"))).click();

                await driver.wait(
                    until.elementIsVisible(await driver.findElement(By.css("#window"))),
                    5000,
                    "tool window did not open"
                );

                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(2);
            });

            it("after creating a filter, user is prompted to choose a layer", async function () {
                await dropdown.click();
                await options[1].click();

                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(2);
                expect(await options[1].getText()).to.equal("Krankenhäuser");
            });

            it("after choosing a layer, user is prompted to choose a property", async function () {
                await dropdown.click();
                await options[1].click();

                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(14);
                expect(await options[1].getText()).to.equal("kh_nummer");
            });

            it("after choosing a property, user is prompted to choose a value", async function () {
                await dropdown.click();
                await (await driver.findElement(
                    By.xpath("//select[@id='dropdown']/option[contains(.,'teilnahme_notversorgung')]"))
                ).click();

                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(4);
                expect(await options[1].getText()).to.equal("Ja");
            });

            it("after choosing a value, filter is created and removable, filter is in effect immediately", async function () {
                await dropdown.click();
                await options[1].click();

                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(3);
                removeButton = driver.findElement(
                    By.xpath("//button[contains(.,'teilnahme_notversorgung')]")
                );
                expect(removeButton).to.exist;

                expect(await driver.executeScript(areAllFeaturesOfLayerVisible, "1711")).to.be.false;
            });

            it("on filter removal, all features are visible again", async function () {
                await removeButton.click();
                await updateInteractionElements();

                expect(dropdown).to.exist;
                expect(options).to.have.lengthOf(2);

                expect(await driver.executeScript(areAllFeaturesOfLayerVisible, "1711")).to.be.true;
            });
        });
    }
}

module.exports = ExtendedFilterTests;
