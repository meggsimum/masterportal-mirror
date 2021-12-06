const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getCenter, getResolution, setResolution, hasVectorLayerLength} = require("../../../../../../test/end2end/library/scripts"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {By, until} = webdriver;

/**
 * Tests regarding searchByCoord tool.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function SearchByCoordTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("SearchByCoord", function () {
            const selectors = {
                    tools: By.xpath("//ul[@id='tools']/.."),
                    toolSearchByCoord: By.xpath("//ul[@id='tools']//span//i[contains(@class,'bi-record-circle')]"),
                    modal: By.css("div .tool-window-vue"),
                    coordSystemSelect: By.xpath("//select[@id='coordSystemField']"),
                    coordinatesNorthingField: By.xpath("//input[@id='coordinatesNorthingField']"),
                    coordinatesEastingField: By.xpath("//input[@id='coordinatesEastingField']"),
                    etrs89Option: By.xpath("//option[contains(.,'ETRS89')]"),
                    wgs84Option: By.xpath("//option[contains(.,'WGS84')]"),
                    wgs84DecimalOption: By.xpath("//option[contains(.,'WGS84(Dezimalgrad)')]"),
                    searchButton: By.xpath("//button[contains(.,'Suche')]")
                },
                expectedResolution = 0.66;
            let driver, counter;

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

            /**
             * Searches for coordinates and checks whether center and mapMarker changed accordingly.
             * @param {object} params parameter object
             * @param {string} params.easting value to put in easting field
             * @param {sttring} params.northing value to put in northing field
             * @param {By} params.optionSelector coordinate system option selector
             * @param {Number[]} params.expectedCenter center that should be zoomed to
             * @returns {void}
             */
            async function searchCoordinatesAndCheckResults ({easting, northing, optionSelector, expectedCenter}) {
                await driver.executeScript(setResolution, 5);
                await driver.wait(until.elementLocated(selectors.coordSystemSelect), 5000);

                const coordSystemSelect = await driver.findElement(selectors.coordSystemSelect),
                    option = await driver.findElement(optionSelector);

                await driver.wait(until.elementIsVisible(coordSystemSelect));

                await coordSystemSelect.click();
                await option.click();

                // following elements can't be fetched before previous clicks, since they'd become stale by now
                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.coordinatesNorthingField)));
                await (await driver.findElement(selectors.coordinatesNorthingField)).clear();
                await (await driver.findElement(selectors.coordinatesNorthingField)).sendKeys(northing);
                await (await driver.findElement(selectors.coordinatesEastingField)).clear();
                await (await driver.findElement(selectors.coordinatesEastingField)).sendKeys(easting);
                await (await driver.findElement(selectors.searchButton)).click();

                await driver.wait(async () => driver.executeScript(hasVectorLayerLength, "markerPoint", 1), 10000);
                expect((await driver.executeScript(getCenter))[0]).to.be.closeTo(expectedCenter[0], 0.005);
                expect((await driver.executeScript(getCenter))[1]).to.be.closeTo(expectedCenter[1], 0.005);
                expect(await driver.executeScript(getResolution)).to.be.closeTo(expectedResolution, 0.005);
            }

            it("displays a modal dialog containing the tool elements, offering the coordinate systems ETRS89, WGS84, and WGS84(Dezimalgrad)", async () => {
                await driver.wait(until.elementLocated(selectors.tools), 5000);

                const tools = await driver.findElement(selectors.tools),
                    toolSearchByCoord = await driver.findElement(selectors.toolSearchByCoord);

                await driver.wait(until.elementIsVisible(tools), 10000, "Tools Menu Entry did not become visible.");
                counter = 0;
                while (!await toolSearchByCoord.isDisplayed() && counter < 10) {
                    await tools.click();
                    await driver.wait(new Promise(r => setTimeout(r, 500)));
                    counter++;
                }
                await toolSearchByCoord.click();
                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)), 10000, "Modal dialog did not become visible.");
            });

            it("zooms to selected coordinates in ETRS89", async () => {
                await searchCoordinatesAndCheckResults({
                    optionSelector: selectors.etrs89Option,
                    easting: "564459",
                    northing: "5935103",
                    expectedCenter: [564459, 5935103]
                });
            });

            it("zooms to selected coordinates in WGS84", async () => {
                await searchCoordinatesAndCheckResults({
                    optionSelector: selectors.wgs84Option,
                    easting: "53° 33' 50''",
                    northing: "9° 59' 40''",
                    expectedCenter: [565863.82, 5935461.37]
                });
            });

            it("zooms to selected coordinates in WGS84(Dezimalgrad)", async () => {
                await searchCoordinatesAndCheckResults({
                    optionSelector: selectors.wgs84DecimalOption,
                    easting: "53.5°",
                    northing: "10.0°",
                    expectedCenter: [566331.53, 5928359.09]
                });
            });
        });
    }
}

module.exports = SearchByCoordTests;
