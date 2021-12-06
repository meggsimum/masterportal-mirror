const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    // Comment code for first end2end test, because node-fetch doesn't work on saucelabs!
    // fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args)),
    masterConfigJson = require("../../../../../portal/master/config.json"),
    // masterConfigJs = require("../../../../../portal/master/config.js"),
    {getOrderedLayerIds, isLayerVisible} = require("../../../library/scripts"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {getOrderedTitleTexts, getOrderedIdsFromConfig, logTestingCloudUrlToTest} = require("../../../library/utils"),
    // {getOrderedTitleTexts, getOrderedTitlesFromConfig, getOrderedIdsFromConfig, logTestingCloudUrlToTest} = require("../../../library/utils"),
    {isMaster} = require("../../../settings"),
    {By, until, Key} = webdriver;

/**
 * @param {Array.<(string|string[])>} arrayWithOptions array to compare, but each index may also hold an array of
 *                                                     options where it suffices if one equals the compareArray entry
 * @param {string[]} compareArray array to compare with
 * @returns {boolean} whether arrays match
 */
// function arrayDeepEqualsWithOptions (arrayWithOptions, compareArray) {
//     return arrayWithOptions.length === compareArray.length &&
//         arrayWithOptions.reduce((bigAnd, current, index) => bigAnd &&
//             (Array.isArray(current)
//                 ? current.includes(compareArray[index])
//                 : current === compareArray[index])
//         , true);
// }

/**
 * Check if layer settings div is available
 * @param {Object} driver selenium driver
 * @returns {void}
 */
async function checkLayersettings (driver) {
    if (Object.keys(await driver.findElements(By.css("ul#root li.layer div"))).length === 0) {
        await (await driver.wait(
            until.elementLocated(By.css("ul#root li.layer span.bootstrap-icon > .bi-gear")),
            12000,
            "layer settings did not appear"
        )).click();
        await new Promise(r => setTimeout(r, 200));
    }
}

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function MenuLayersTests ({builder, url, resolution, capability}) {
    describe("Menu Layers", async function () {
        let driver,
            // services,
            // as seen in Map
            mapOrderedLayerIds,
            mapOrderedElementTexts,
            // as specified in configJSON
            // configGivenTitleOrder,
            configGivenIdOrder;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            // services = await new Promise((resolve, reject) => fetch(masterConfigJs.layerConf)
            //     .then(response => response.text())
            //     .then(text => resolve(JSON.parse(text.trim())))
            //     .catch(reject)
            // );
            driver = await getDriver();

            configGivenIdOrder = getOrderedIdsFromConfig(masterConfigJson);
        });

        beforeEach(async function () {
            if (!await driver.findElement(By.css("ul#tree")).isDisplayed()) {
                await (await driver.wait(
                    until.elementLocated(By.css("ul#root li:first-child")),
                    12000,
                    "navigation bar did not appear"
                )).click();
            }
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


        /*
         * Tests only work in Chrome. The scripts and utils return a different order of elements
         * for chromedriver and geckodriver. Element order is probably simply not guaranteed in WebDrivers?
         */
        if (isMaster(url)) {
            it("shows layers in order of config.json in LT", async function () {
                const tree = await driver.wait(
                    until.elementLocated(By.css("ul#tree")),
                    12000,
                    "layer tree did not appear"
                );

                await driver.wait(
                    until.elementIsVisible(tree),
                    12000,
                    "layer tree did not become visible"
                );

                mapOrderedElementTexts = await getOrderedTitleTexts(driver);

                // configGivenTitleOrder = getOrderedTitlesFromConfig(masterConfigJson, services);

                // expect(arrayDeepEqualsWithOptions(configGivenTitleOrder, mapOrderedElementTexts)).to.be.true;
            });

            it("has the same layer order in tree and map in LT", async function () {
                mapOrderedLayerIds = await driver.executeScript(getOrderedLayerIds);

                expect(mapOrderedLayerIds).to.deep.equal(configGivenIdOrder);
            });

            it("allows activating and deactivating layers in LT", async function () {
                // The first layer in tree "100 jahre Stadtgruen POIS" has a transparency of "0.25"
                const checkLayerId = configGivenIdOrder[0];

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0].findElement(By.css("span.title"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.true;
                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0].findElement(By.css("span.title"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.false;
                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0].findElement(By.css("span.title"))).click();
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.true;
            });

            it("allows activating and deactivating layers in LT via space key", async function () {
                // The second layer in tree "Verkehrskameras" has a transparency of "1.00"
                const checkLayerId = configGivenIdOrder[1];

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[1]).sendKeys(Key.SPACE);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "1.00")).to.be.true;
                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[1]).sendKeys(Key.SPACE);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "1.00")).to.be.false;
                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[1]).sendKeys(Key.SPACE);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "1.00")).to.be.true;
            });

            it("opens an information window with the info button", async function () {
                await driver.wait(until.elementLocated(By.css("ul#root li.layer span.bootstrap-icon > .bi-info-circle-fill")), 12000);
                await (await driver.findElement(By.css("ul#root li.layer span.bootstrap-icon > .bi-info-circle-fill"))).click();
                await driver.wait(
                    until.elementLocated(By.css("div#layerInformation")),
                    12000,
                    "Info window did not appear"
                );
            });

            it("allows using the tab key for navigation", async function () {

                const checkLayerId = configGivenIdOrder[1];

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[1]).sendKeys(Key.ENTER);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "1.00")).to.be.false;

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0]).sendKeys(Key.ENTER);

                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.TAB);
                await driver.switchTo().activeElement().sendKeys(Key.SPACE);

                expect(await driver.executeScript(isLayerVisible, checkLayerId, "1.00")).to.be.true;
            });

            it("allows navigation with the arrow keys", async function () {
                const checkLayerId = configGivenIdOrder[0];

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0]).sendKeys(Key.ENTER);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.true;

                await driver.switchTo().activeElement().sendKeys(Key.ARROW_DOWN);
                await driver.switchTo().activeElement().sendKeys(Key.ARROW_DOWN);
                await driver.switchTo().activeElement().sendKeys(Key.ARROW_DOWN);

                await driver.switchTo().activeElement().sendKeys(Key.ARROW_UP);
                await driver.switchTo().activeElement().sendKeys(Key.ARROW_UP);
                await driver.switchTo().activeElement().sendKeys(Key.ARROW_UP);

                await driver.switchTo().activeElement().sendKeys(Key.SPACE);
                expect(await driver.executeScript(isLayerVisible, checkLayerId, "0.25")).to.be.false;
            });

            it("displays an option row", async function () {
                await driver.wait(until.elementLocated(By.css("ul#root li.layer span.bootstrap-icon > .bi-gear")), 12000);
                await (await driver.findElement(By.css("ul#root li.layer span.bootstrap-icon > .bi-gear"))).click();
                await driver.wait(
                    until.elementLocated(By.css("ul#root li.layer div.layer-settings")),
                    12000,
                    "layer settings menu did not appear upon clicking cog symbol"
                );

                // wait for animation to finish
                await new Promise(r => setTimeout(r, 200));
            });

            it("allows manipulating layer transparency", async function () {
                await checkLayersettings(driver);
                /**
                 * @param {string} sign must be "plus" or "minus"
                 * @returns {WebdriverWebElement} fresh transparency button
                 */
                async function getButton (sign) {
                    if (sign === "plus") {
                        return driver.findElement(By.css(`span.transparency span.bootstrap-icon > .bi-${sign}-circle-fill`));
                    }
                    return driver.findElement(By.css("span.transparency span.bootstrap-icon > .bi-dash-circle-fill"));
                }


                const id = mapOrderedLayerIds[0];

                await (await (await driver.findElements(By.css("ul#root li.layer a.layer-item")))[0]).sendKeys(Key.ENTER);
                expect(await driver.executeScript(isLayerVisible, id, "0.25")).to.be.true;

                // buttons have to be re-fetched each click since they tend to go stale
                await (await getButton("minus")).click();
                await (await getButton("minus")).click();
                await (await getButton("minus")).click();

                expect(await driver.executeScript(isLayerVisible, id, "0.55")).to.be.true;

                await (await getButton("plus")).sendKeys(Key.ENTER);
                await (await getButton("plus")).sendKeys(Key.ENTER);
                await (await getButton("plus")).sendKeys(Key.ENTER);

                expect(await driver.executeScript(isLayerVisible, id, "0.25")).to.be.true;
            });

            it("arrows allow moving layers up in tree and map order", async function () {
                await checkLayersettings(driver);
                await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.bootstrap-icon > .bi-arrow-down"))).click();

                const newTitleOrder = await getOrderedTitleTexts(driver),
                    newMapOrder = await driver.executeScript(getOrderedLayerIds);

                expect(newTitleOrder[0])
                    .to.equal(mapOrderedElementTexts[1]);
                expect(newTitleOrder[1])
                    .to.equal(mapOrderedElementTexts[0]);
                expect(mapOrderedLayerIds[0])
                    .to.equal(newMapOrder[1]);
                expect(mapOrderedLayerIds[1])
                    .to.equal(newMapOrder[0]);
            });

            it("arrows allow moving layers down in tree and map order", async function () {
                await checkLayersettings(driver);
                await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.bootstrap-icon > .bi-arrow-up"))).click();

                const newTitleOrder = await getOrderedTitleTexts(driver),
                    newMapOrder = await driver.executeScript(getOrderedLayerIds),
                    lastMapOrderIndex = mapOrderedLayerIds.length - 1;

                expect(newTitleOrder[0])
                    .to.equal(mapOrderedElementTexts[0]);
                expect(newTitleOrder[1])
                    .to.equal(mapOrderedElementTexts[1]);
                expect(mapOrderedLayerIds[lastMapOrderIndex - 1])
                    .to.equal(newMapOrder[lastMapOrderIndex - 1]);
                expect(mapOrderedLayerIds[lastMapOrderIndex])
                    .to.equal(newMapOrder[lastMapOrderIndex]);
            });

            it("arrows moving up do nothing if layer is already first", async function () {
                await checkLayersettings(driver);
                await driver.wait(until.elementLocated(By.css("ul#root li.layer div.layer-settings span.bootstrap-icon > .bi-arrow-up")), 12000);
                await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.bootstrap-icon > .bi-arrow-up"))).click();

                const newTitleOrder = await getOrderedTitleTexts(driver),
                    newMapOrder = await driver.executeScript(getOrderedLayerIds),
                    lastMapOrderIndex = mapOrderedLayerIds.length - 1;

                expect(newTitleOrder[0])
                    .to.equal(mapOrderedElementTexts[0]);
                expect(newTitleOrder[1])
                    .to.equal(mapOrderedElementTexts[1]);
                expect(mapOrderedLayerIds[lastMapOrderIndex - 1])
                    .to.equal(newMapOrder[lastMapOrderIndex - 1]);
                expect(mapOrderedLayerIds[lastMapOrderIndex])
                    .to.equal(newMapOrder[lastMapOrderIndex]);
            });

            it("allows removing layer from tree and map", async function () {
                await checkLayersettings(driver);
                await driver.wait(until.elementLocated(By.css("ul#root li.layer div.layer-settings span.remove-layer")), 12000);
                await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.remove-layer"))).click();

                await new Promise(r => setTimeout(r, 1000));

                const newTitleOrder = await getOrderedTitleTexts(driver);

                expect(newTitleOrder.length).to.equal(mapOrderedElementTexts.length - 1);
                expect(newTitleOrder.includes(mapOrderedElementTexts[0])).to.be.false;
                expect(await driver.executeScript(isLayerVisible, mapOrderedLayerIds[0])).to.be.false;
            });

            it("arrows moving down do nothing if layer is already last", async function () {
                await checkLayersettings(driver);
                await driver.wait(until.elementLocated(By.css("ul#root li.layer:nth-child(29) span.bootstrap-icon > .bi-gear")), 12000);
                await (await driver.findElement(By.css("ul#root li.layer:nth-child(29) span.bootstrap-icon > .bi-gear"))).click();

                await driver.wait(until.elementLocated(By.css("ul#root li.layer div.layer-settings")));

                // wait for animation to finish
                await new Promise(r => setTimeout(r, 500));

                await (await driver.findElement(By.css("ul#root li.layer div.layer-settings span.bootstrap-icon > .bi-arrow-down"))).click();

                const newTitleOrder = await getOrderedTitleTexts(driver),
                    newMapOrder = await driver.executeScript(getOrderedLayerIds),
                    lastMapTitleOrderIndex = mapOrderedLayerIds.length - 1,
                    lastNewTitleOrderIndex = newTitleOrder.length - 1,
                    lastMapIdOrderIndex = mapOrderedElementTexts.length - 1,
                    lastNewIdOrderIndex = newMapOrder.length - 1;

                expect(newTitleOrder[lastNewTitleOrderIndex - 1])
                    .to.equal(mapOrderedElementTexts[lastMapTitleOrderIndex - 1]);
                expect(newTitleOrder[lastNewTitleOrderIndex])
                    .to.equal(mapOrderedElementTexts[lastMapTitleOrderIndex]);

                expect(mapOrderedLayerIds[lastMapIdOrderIndex - 1])
                    .to.equal(newMapOrder[lastNewIdOrderIndex - 1]);
                expect(mapOrderedLayerIds[lastMapIdOrderIndex])
                    .to.equal(newMapOrder[lastNewIdOrderIndex]);
            });

            it("close the layerInformation", async function () {
                await (
                    await driver.findElement(By.css("div#layerInformation div.tool-window-heading div.heading-element span.bootstrap-icon > .bi-x-lg"))
                ).click();
            });
        }
    });
}

module.exports = MenuLayersTests;
