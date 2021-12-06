const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {getDriver, initDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {getCenter, getResolution, setResolution, hasVectorLayerLength} = require("../../../../../../test/end2end/library/scripts"),
    {logTestingCloudUrlToTest, reclickUntilNotStale, closeSingleAlert} = require("../../../../../../test/end2end/library/utils"),
    {isBasic, isCustom, isMobile} = require("../../../../../../test/end2end/settings"),
    namedProjectionsBasic = require("../../../../../../portal/basic/config").namedProjections,
    namedProjectionsMaster = require("../../../../../../portal/master/config").namedProjections,
    namedProjectionsCustom = require("../../../../../../portal/masterCustom/config").namedProjections,
    namedProjectionsDefault = require("../../../../../../portal/masterDefault/config").namedProjections,
    {isMarkerPointVisible, getMarkerPointCoord} = require("../../../../../../test/end2end/library/scripts"),
    {By, until, Key} = webdriver;

/**
 * Tests regarding coordToolkit tool.
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {String} param.config to switch the config between namedProjectionsBasic, -Master -Default or -Custom ("basic", "master", "default", "custom")
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
async function CoordToolkitTests ({builder, url, resolution, config, capability}) {
    describe("CoordToolkit", function () {
        const selectors = {
                tools: By.xpath("//ul[@id='tools']/.."),
                toolCoordToolkit: By.css("ul#tools span.bootstrap-icon > .bi-globe"),
                modal: By.css(".tool-window-vue"),
                header: By.css(".tool-window-vue p.title span"),
                supplyCoordRadio: By.css("input#supplyCoordRadio"),
                searchByCoordRadio: By.css("input#searchByCoordRadio"),
                coordSystemLabel: By.xpath("//label[@for='coordSystemField']"),
                coordSystemSelect: By.css("select#coordSystemField"),
                eastingLabel: By.css("label#coordinatesEastingLabel"),
                eastingField: By.css("input#coordinatesEastingField"),
                northingLabel: By.css("label#coordinatesNorthingLabel"),
                northingField: By.css("input#coordinatesNorthingField"),
                copyNorthingBtn: By.css("button#copyNorthingBtn"),
                copyEastingBtn: By.css("button#copyEastingBtn"),
                copyCoordsPairBtn: By.css("button#copyCoordsPairBtn"),
                heightLabel: By.css("label#coordinatesHeightLabel"),
                heightFieldSel: By.css("input#coordinatesHeightField"),
                wgs84Option: By.xpath("//option[contains(.,'WGS 84 (long/lat)')]"),
                utm32nOption: By.xpath("//option[contains(.,'ETRS89/UTM 32N')]"),
                etrs89Option: By.xpath("//option[contains(.,'ETRS89')]"),
                wgs84DecimalOption: By.xpath("//option[contains(.,'WGS 84(Dezimalgrad) (EPSG:4326)')]"),
                viewport: By.css(".ol-viewport"),
                searchByCoordBtn: By.css("button#searchByCoordBtn")
            },
            expectedResolution = 0.66;
        let driver, viewport, eastingField, northingField, heightField, searchByCoordBtn;

        /**
         * Repeatable parameterized workflow.
         * @param {Object} params parameter object
         * @param {Boolean} [params.clickAfterFirstMove=false] if true, will click after first mouse move
         * @param {Boolean} [params.expectUnchanged=false] if true, will expect values for east, north, and marker style to be unchanges
         * @returns {void}
         */
        async function moveAndClickAndCheck ({clickAfterFirstMove = false, expectUnchanged = false, expectHightEquals = false}) {
            let markerVisible = null,
                markerCoord = null,
                hightValue = null,
                firstMove = driver.actions({bridge: true})
                    .move({origin: viewport, x: 150, y: 150});

            firstMove = clickAfterFirstMove ? firstMove.click() : firstMove;

            await firstMove.perform();

            const eastValue = await eastingField.getAttribute("value"),
                northValue = await northingField.getAttribute("value"),
                expectPhrase = expectUnchanged ? "to" : "not",
                expectHightPhrase = expectHightEquals ? "to" : "not";

            await driver.wait(new Promise(r => setTimeout(r, 200)));

            if (!isBasic(url) && !isCustom(url)) {
                hightValue = await heightField.getAttribute("value");
            }

            await driver.actions({bridge: true})
                .move({origin: viewport, x: 50, y: 50})
                .perform();

            expect(eastValue)[expectPhrase].equal(await eastingField.getAttribute("value"));
            expect(northValue)[expectPhrase].equal(await northingField.getAttribute("value"));
            if (!isBasic(url) && !isCustom(url) && clickAfterFirstMove) {
                expect(hightValue)[expectHightPhrase].equal(await heightField.getAttribute("value"));
            }

            markerCoord = await driver.executeScript(getMarkerPointCoord);
            markerVisible = await driver.executeScript(isMarkerPointVisible);

            expect(markerVisible).equals(true);
            expect(eastValue)[expectPhrase].equal(markerCoord[0].toFixed(2));
            expect(northValue)[expectPhrase].equal(markerCoord[1].toFixed(2));
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


        it("displays a modal dialog containing the tool elements", async () => {
            // can't keep tools/toolCoordToolkit as variable - tends to go stale in /portal/basic
            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.tools)));
            while (!await (await driver.findElement(selectors.toolCoordToolkit)).isDisplayed()) {
                await reclickUntilNotStale(driver, selectors.tools);
                await driver.wait(new Promise(r => setTimeout(r, 100)));
            }
            await (await driver.findElement(selectors.toolCoordToolkit)).click();

            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));

            await driver.wait(until.elementLocated(selectors.header), 5000);
            await driver.wait(until.elementLocated(selectors.supplyCoordRadio), 5000);
            await driver.wait(until.elementLocated(selectors.searchByCoordRadio), 5000);

            await driver.wait(until.elementLocated(selectors.coordSystemLabel), 5000);
            await driver.wait(until.elementLocated(selectors.coordSystemSelect), 5000);

            await await driver.findElement(selectors.supplyCoordRadio).click();

            await driver.wait(until.elementLocated(selectors.eastingLabel), 5000);
            eastingField = await driver.wait(until.elementLocated(selectors.eastingField), 5000);

            await driver.wait(until.elementLocated(selectors.northingLabel), 5000);
            northingField = await driver.wait(until.elementLocated(selectors.northingField), 5000);

            if (!isBasic(url) && !isCustom(url)) {
                await driver.wait(until.elementLocated(selectors.heightLabel), 5000);
                heightField = await driver.wait(until.elementLocated(selectors.heightFieldSel), 5000);
            }

            viewport = await driver.findElement(selectors.viewport);

            // /portal/basic sometimes requires setup time until all events are registered
            await driver.wait(new Promise(r => setTimeout(r, 1000)));
        });

        it("check readonly of coordinates fields", async () => {
            const eastValue = await eastingField.getAttribute("readonly"),
                northValue = await northingField.getAttribute("readonly");

            expect(eastValue).equal("true");
            expect(northValue).equal("true");
        });

        it("the displayed coordinates and map marker position change on mouse movement", async () => {
            await moveAndClickAndCheck({});
        });

        it("after click, coordinates and marker are frozen despite further mouse movement", async () => {
            await moveAndClickAndCheck({
                clickAfterFirstMove: true,
                expectUnchanged: true,
                expectHightEquals: true
            });
        });

        if (isMobile(url)) {
            it("mobile: coordinates and marker move to new position without sticking to the 'mouse'", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true,
                    expectUnchanged: true
                });
            });
        }
        else {
            it("desktop: after another click, coordinates and marker stick to mouse again", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true,
                    expectHightEquals: true
                });
            });
        }
        it("copies coordinate values to clipboard by click on copy-button", async () => {
            const searchInput = await driver.findElement(By.css("#searchInput")),
                copyNorthingBtn = await driver.wait(until.elementLocated(selectors.copyNorthingBtn), 5000),
                copyEastingBtn = await driver.wait(until.elementLocated(selectors.copyEastingBtn), 5000),
                copyCoordsPairBtn = await driver.wait(until.elementLocated(selectors.copyCoordsPairBtn), 5000),
                northingValue = await northingField.getAttribute("value"),
                eastingValue = await eastingField.getAttribute("value");

            await copyNorthingBtn.click();
            await closeSingleAlert(driver, "Inhalt wurde in die Zwischenablage kopiert.");
            await driver.wait(new Promise(r => setTimeout(r, 100)));
            await searchInput.sendKeys(Key.CONTROL, "v");
            expect(await searchInput.getAttribute("value")).to.equal(northingValue);
            await searchInput.clear();

            await copyEastingBtn.click();
            await closeSingleAlert(driver, "Inhalt wurde in die Zwischenablage kopiert.");
            await driver.wait(new Promise(r => setTimeout(r, 100)));
            await searchInput.sendKeys(Key.CONTROL, "v");
            expect(await searchInput.getAttribute("value")).to.equal(eastingValue);
            await searchInput.clear();

            await copyCoordsPairBtn.click();
            await closeSingleAlert(driver, "Inhalt wurde in die Zwischenablage kopiert.");
            await driver.wait(new Promise(r => setTimeout(r, 100)));
            await searchInput.sendKeys(Key.CONTROL, "v");
            expect(await searchInput.getAttribute("value")).to.equal(eastingValue + "|" + northingValue);
            await searchInput.clear();
        });

        it("offers the configured coordinate systems in supplyCoord-mode", async () => {
            await checkCoordinateSystems();
        });

        /**
         * Checks the coordinate systems.
         * @returns {void}
         */
        async function checkCoordinateSystems () {
            const namedProjections = {
                    basic: namedProjectionsBasic,
                    master: namedProjectionsMaster,
                    default: namedProjectionsDefault,
                    custom: namedProjectionsCustom
                }[config],
                epsgCodes = namedProjections.map(a => a[0]),
                // if EPSG:4326 is available add same projection in decimal-system to options
                extraOptionAdded = epsgCodes.find(code => code === "EPSG:4326"),
                codesLenth = extraOptionAdded ? epsgCodes.length + 1 : epsgCodes.length;

            // all configured systems exist
            for (const epsgCode of epsgCodes) {
                expect(await driver.findElement(By.xpath(`//select[@id='coordSystemField']//option[contains(.,'${epsgCode}')]`))).to.exist;
            }
            expect(await driver.findElements(By.xpath("//select[@id='coordSystemField']//option"))).to.have.length(codesLenth);
        }


        it("changes mode to searchByCoord if click on radio", async () => {
            const supplyCoordRadio = await driver.findElement(selectors.supplyCoordRadio),
                searchByCoordRadio = await driver.findElement(selectors.searchByCoordRadio);

            expect(await supplyCoordRadio.getAttribute("checked")).equal("true");
            await searchByCoordRadio.click();
            expect(await searchByCoordRadio.getAttribute("checked")).equal("true");
            expect(await supplyCoordRadio.getAttribute("checked")).equal(null);
            searchByCoordBtn = await driver.wait(until.elementLocated(selectors.searchByCoordBtn), 5000);
            expect(await searchByCoordBtn.getAttribute("disabled")).equal(null);
        });

        it("offers the configured coordinate systems in searchByCoord-mode", async () => {
            await checkCoordinateSystems();
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
            await driver.wait(until.elementIsVisible(await driver.findElement(selectors.northingField)));
            await (await driver.findElement(selectors.northingField)).clear();
            await (await driver.findElement(selectors.northingField)).sendKeys(northing);
            await (await driver.findElement(selectors.eastingField)).clear();
            await (await driver.findElement(selectors.eastingField)).sendKeys(easting);
            await searchByCoordBtn.click();

            await driver.wait(async () => driver.executeScript(hasVectorLayerLength, "markerPoint", 1), 10000);
            expect((await driver.executeScript(getCenter))[0]).to.be.closeTo(expectedCenter[0], 0.005);
            expect((await driver.executeScript(getCenter))[1]).to.be.closeTo(expectedCenter[1], 0.005);
            expect(await driver.executeScript(getResolution)).to.be.closeTo(expectedResolution, 0.005);
        }

        it("zooms to selected coordinates in ETRS89", async () => {
            await searchCoordinatesAndCheckResults({
                optionSelector: selectors.etrs89Option,
                easting: "564459",
                northing: "5935103",
                expectedCenter: [564459, 5935103]
            });
        });

        (isBasic(url) || isCustom(url) ? it.skip : it)("zooms to selected coordinates in WGS84", async () => {
            await searchCoordinatesAndCheckResults({
                optionSelector: selectors.wgs84Option,
                easting: "53° 33' 50''",
                northing: "9° 59' 40''",
                expectedCenter: [565863.82, 5935461.37]
            });
        });

        (isBasic(url) || isCustom(url) ? it.skip : it)("zooms to selected coordinates in WGS84(Dezimalgrad)", async () => {
            await searchCoordinatesAndCheckResults({
                optionSelector: selectors.wgs84DecimalOption,
                easting: "53.5°",
                northing: "10.0°",
                expectedCenter: [566331.53, 5928359.09]
            });
        });
    });
}

module.exports = CoordToolkitTests;
