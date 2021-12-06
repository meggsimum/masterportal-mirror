const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {reclickUntilNotStale, logTestingCloudUrlToTest, closeSingleAlert} = require("../../../../../../test/end2end/library/utils"),
    {isMobile, isMaster} = require("../../../../../../test/end2end/settings"),
    namedProjectionsBasic = require("../../../../../../portal/basic/config").namedProjections,
    namedProjectionsMaster = require("../../../../../../portal/master/config").namedProjections,
    namedProjectionsCustom = require("../../../../../../portal/masterCustom/config").namedProjections,
    namedProjectionsDefault = require("../../../../../../portal/masterDefault/config").namedProjections,
    {isMarkerPointVisible, getMarkerPointCoord} = require("../../../../../../test/end2end/library/scripts"),
    {By, until, Key} = webdriver;

/**
 * Tests regarding coord tool.
 * @param {Object} params e2eTestParams
 * @param {module:selenium-webdriver.Builder} params.builder the selenium.Builder object
 * @param {String} params.url the url to test
 * @param {String} params.resolution formatted as "AxB" with A, B integers
 * @param {String} param.config to switch the config between namedProjectionsBasic, -Master -Default or -Custom ("basic", "master", "default", "custom")
 * @param {module:selenium-webdriver.Capabilities} param.capability sets the capability when requesting a new session - overwrites all previously set capabilities
 * @returns {void}
 */
async function CoordTests ({builder, url, resolution, config, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("SupplyCoord", function () {
            const selectors = {
                tools: By.xpath("//ul[@id='tools']/.."),
                toolCoord: By.css("ul#tools span.bootstrap-icon > .bi-bullseye"),
                modal: By.css(".tool-window-vue"),
                header: By.css(".tool-window-vue p.title span"),
                coordSystemLabel: By.xpath("//label[@for='coordSystemField']"),
                coordSystemSelect: By.css("select#coordSystemField"),
                eastingLabel: By.css("label#coordinatesEastingLabel"),
                eastingField: By.css("input#coordinatesEastingField"),
                northingLabel: By.css("label#coordinatesNorthingLabel"),
                northingField: By.css("input#coordinatesNorthingField"),
                wgs84Option: By.xpath("//option[contains(.,'WGS 84 (long/lat)')]"),
                utm32nOption: By.xpath("//option[contains(.,'ETRS89/UTM 32N')]"),
                viewport: By.css(".ol-viewport")
            };
            let driver, viewport, eastingField, northingField;

            /**
             * Repeatable parameterized workflow.
             * @param {Object} params parameter object
             * @param {Boolean} [params.clickAfterFirstMove=false] if true, will click after first mouse move
             * @param {Boolean} [params.expectUnchanged=false] if true, will expect values for east, north, and marker style to be unchanges
             * @returns {void}
             */
            async function moveAndClickAndCheck ({clickAfterFirstMove = false, expectUnchanged = false}) {
                let markerVisible = null,
                    markerCoord = null,

                    firstMove = driver.actions({bridge: true})
                        .move({origin: viewport, x: 150, y: 150});

                firstMove = clickAfterFirstMove ? firstMove.click() : firstMove;

                await firstMove.perform();

                const eastValue = await eastingField.getAttribute("value"),
                    northValue = await northingField.getAttribute("value"),
                    expectPhrase = expectUnchanged ? "to" : "not";

                await driver.actions({bridge: true})
                    .move({origin: viewport, x: 50, y: 50})
                    .perform();

                expect(eastValue)[expectPhrase].equal(await eastingField.getAttribute("value"));
                expect(northValue)[expectPhrase].equal(await northingField.getAttribute("value"));

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
                // can't keep tools/toolCoord as variable - tends to go stale in /portal/basic
                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.tools)));
                while (!await (await driver.findElement(selectors.toolCoord)).isDisplayed()) {
                    await reclickUntilNotStale(driver, selectors.tools);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                }
                await (await driver.findElement(selectors.toolCoord)).click();

                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal)));

                await driver.wait(until.elementLocated(selectors.header), 5000);

                await driver.wait(until.elementLocated(selectors.coordSystemLabel), 5000);
                await driver.wait(until.elementLocated(selectors.coordSystemSelect), 5000);

                await driver.wait(until.elementLocated(selectors.eastingLabel), 5000);
                eastingField = await driver.wait(until.elementLocated(selectors.eastingField), 5000);

                await driver.wait(until.elementLocated(selectors.northingLabel), 5000);
                northingField = await driver.wait(until.elementLocated(selectors.northingField), 5000);

                viewport = await driver.findElement(selectors.viewport);

                // /portal/basic sometimes requires setup time until all events are registered
                await driver.wait(new Promise(r => setTimeout(r, 1000)));
            });

            it("the displayed coordinates and map marker position change on mouse movement", async () => {
                await moveAndClickAndCheck({});
            });

            it("after click, coordinates and marker are frozen despite further mouse movement", async () => {
                await moveAndClickAndCheck({
                    clickAfterFirstMove: true,
                    expectUnchanged: true
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
                        clickAfterFirstMove: true
                    });
                });
            }

            it.skip("copies coordinate values on click to clipboard", async () => {
                /* Since there seems to be no universally supported way to check what
                * Strg+V produces, we're just dumping the information to the search
                * bar and check if the expected value arrived. */
                const searchInput = await driver.findElement(By.css("#searchInput"));

                for (const field of [northingField, eastingField]) {
                    const value = await field.getAttribute("value");

                    await field.click();
                    await closeSingleAlert(driver, "Inhalt wurde in die Zwischenablage kopiert.");

                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                    await searchInput.sendKeys(Key.CONTROL, "v");

                    expect(await searchInput.getAttribute("value")).to.equal(value);
                    await searchInput.clear();
                }
            });

            it("offers the configured coordinate systems", async () => {
                const namedProjections = {
                        basic: namedProjectionsBasic,
                        master: namedProjectionsMaster,
                        default: namedProjectionsDefault,
                        custom: namedProjectionsCustom
                    }[config],
                    titles = namedProjections.map(a => a[1].split("+title=").pop().split(" +")[0]);

                // all configured systems exist
                for (const title of titles) {
                    expect(await driver.findElement(By.xpath(`//select[@id='coordSystemField']//option[contains(.,'${title}')]`))).to.exist;
                }

                // the amount of available systems equals the amount of configures systems
                expect(await driver.findElements(By.xpath("//select[@id='coordSystemField']//option"))).to.have.length(titles.length);
            });

            it("displays values according to chosen coordinate system", async () => {
                await (await driver.findElement(selectors.coordSystemSelect)).click();
                await (await driver.findElement(selectors.utm32nOption)).click();

                expect(await northingField.getAttribute("value")).to.match(/\d{7}\.\d{2}/g);
                expect(await eastingField.getAttribute("value")).to.match(/\d{6}\.\d{2}/g);
            });
        });
    }
}

module.exports = CoordTests;
