const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {logTestingCloudUrlToTest} = require("../../../library/utils"),
    {getDirection, getCenter, areAllLayersHidden, isObModeOn, getObModeResolution} = require("../../../library/scripts"),
    {isMaster, is2D, isMobile} = require("../../../settings"),
    {By, until} = webdriver,
    /**
     * Copied from "vcs-oblique/src/vcs/oblique/viewDirection" since
     * mocha is not configured to be able to read files using export syntax.
     * @enum {number}
     * @property {number} NORTH
     * @property {number} EAST
     * @property {number} SOUTH
     * @property {number} WEST
     * @memberOf vcs.oblique
     * @api
     */
    ViewDirection = {
        NORTH: 1,
        EAST: 2,
        SOUTH: 3,
        WEST: 4
    };

/**
 * OB Mode tests.
 * Note that controls that have regular tests are rerun in OB mode to test them,
 * while this test suite models turning OB mode on/off and testing elements only
 * existing within OB mode.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function Button3DTests ({builder, url, resolution, mode, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
    /* only run tests
     * - in non-mobile mode (does not have OB mode)
     * - in custom and default (have OB mode)
     * - in 2D mode because de-/activating OB is part of this test (OB mode is for rerunning tools/search tests in OB)
     *
     * TODO These tests are currently always skipped (|| true) since OB mode tests are very brittle. Each run demands a download
     * of about 40MB, which may take more than a minute and blocks the pipe. Tests being positive/negative toggles a lot
     * without changing this code at all. Maybe these things will change after OB mode leaves its beta phase.
     */
        const skipAll = !is2D(mode) || isMobile(resolution) || true;

        (skipAll ? describe.skip : describe)("Modules Controls ButtonOblique", function () {
            let driver, buttonOB, zoomInButton, zoomOutButton, northPointer, westPointer;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await getDriver(builder, url, resolution);
                await driver.wait(until.elementLocated(By.css("#buttonOblique")));
                buttonOB = await driver.findElement(By.css("#buttonOblique"));
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
                    await driver.wait(until.elementLocated(By.css("#buttonOblique")));
                    buttonOB = await driver.findElement(By.css("#buttonOblique"));
                }
                await driver.wait(new Promise(r => setTimeout(r, 2000)));
            });

            it("enabling OB mode adds compass", async function () {
                await buttonOB.click();
                // downloads >42MB before setting compass, give it some time
                await driver.wait(until.elementLocated(By.css("#orientation3d .control-box-container.oblique #zoom-in")), 120000);

                zoomInButton = await driver.findElement(By.css("#orientation3d .control-box-container.oblique #zoom-in"));
                zoomOutButton = await driver.findElement(By.css("#orientation3d .control-box-container.oblique #zoom-out"));
                northPointer = await driver.findElement(By.css("#orientation3d .compass.oblique #north-pointer"));
                westPointer = await driver.findElement(By.css("#orientation3d .compass.oblique #west-pointer"));
            });

            it("shows oblique map, hides other layers, is initially directed north", async function () {
                expect(await driver.executeScript(getDirection)).to.equal(ViewDirection.NORTH);
                expect(await northPointer.getCssValue("transform")).to.equal("matrix(1, 0, 0, 1, 0, 0)");
                expect(await driver.executeScript(isObModeOn)).to.be.true;
                expect(await driver.executeScript(areAllLayersHidden)).to.be.true;
            });

            it("disables tools (except contact), topic tree, and legend", async function () {
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))));
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))));
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//span[contains(.,'Legende')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//a[contains(.,'Kontakt')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))));
            });

            it("turns view and compass on pressing W", async function () {
                await westPointer.click();
                expect(await northPointer.getCssValue("transform")).to.not.equal("matrix(1, 0, 0, 1, 0, 0)");
                expect(await driver.executeScript(getDirection)).to.equal(ViewDirection.WEST);
            });

            it("compass allows zooming in and out", async function () {
                const initialResolution = await driver.executeScript(getObModeResolution);
                let nextResolution;

                await zoomInButton.click();
                await driver.wait(async () => (nextResolution = await driver.executeScript(getObModeResolution)) < initialResolution, 5000);
                await zoomOutButton.click();
                await driver.wait(async () => await driver.executeScript(getObModeResolution) > nextResolution, 5000);
            });

            it("works with views", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))).click();
                await (await driver.findElement(By.xpath("//ul[@id='ansichten']//a[contains(.,'Ansicht1')]"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))).click();
                expect(await driver.executeScript(getCenter)).to.deep.equal([564028.7954571751, 5934555.967867207]);
            });

            it("disables OB mode when pressed again", async function () {
                await buttonOB.click();
                await driver.wait(until.elementIsNotVisible(zoomInButton));
                expect(await driver.executeScript(isObModeOn)).to.be.false;
                expect(await driver.executeScript(areAllLayersHidden)).to.be.false;
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//span[contains(.,'Legende')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//a[contains(.,'Kontakt')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))));
            });

            it("allows switching from OB to 3D mode", async function () {
                const button3D = await driver.findElement(By.css("#button3D"));

                await buttonOB.click();
                await driver.wait(until.elementIsVisible(By.css("#orientation3d .control-box-container.oblique #zoom-in")));
                await button3D.click();
                await driver.wait(until.elementIsVisible(By.css("#orientation3d .control-box-container #tilt-down")));
            });
        });
    }
}

module.exports = Button3DTests;
