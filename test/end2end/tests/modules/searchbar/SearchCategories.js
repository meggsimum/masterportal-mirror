const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {reclickUntilNotStale, logTestingCloudUrlToTest} = require("../../../library/utils"),
    {getCenter, setCenter, getResolution, setResolution, hasVectorLayerLength, hasVectorLayerStyle} = require("../../../library/scripts"),
    {isMaster, isChrome} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding search categories.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function SearchCategories ({builder, browsername, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        // TODO with the current configurations, none has the sufficient specialWFS set; configurations need to be expanded first
        describe("Search Categories", function () {
            const searchString = "Haus",
                resultsSelector = By.css("#searchInputUL > li.results");
            let driver, searchInput, searchList, initialCenter, initialResolution, clear;

            /**
             * Clears search bar (if necessary), re-enters search word, opens category view.
             * @param {String} [searchKey=searchString] String that is searched for.
             * @returns {void}
             */
            async function reopenCategories (searchKey = searchString) {
                if (await clear.isDisplayed()) {
                    await clear.click();
                }
                await driver.executeScript(setResolution, initialResolution);
                await driver.executeScript(setCenter, initialCenter);

                await searchInput.sendKeys(searchKey);
                await driver.wait(until.elementIsVisible(searchList));
                /* clicking this element may do nothing (especially in Firefox) when
                * searches are still running; to circumvent this issue, the element
                * is clicked until it's no longer found, assuming the category
                * menu was opened */
                do {
                    await reclickUntilNotStale(driver, resultsSelector);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(resultsSelector)).length);
            }

            /**
             * Clicks a hit from a search category and verifies expected behaviour occurs.
             * @param {object} params parameter object
             * @param {boolean} params.setMarker if true, checks if marker is visible
             * @param {boolean} params.showsPolygon if true, checks if polygon is set in mapMarker layer
             * @param {boolean} params.movesCenter if true, checks if center point moved (assuming it was set to initialCenter beforehand)
             * @param {boolean} params.changesResolution if true, checks if resolution changed (assuming it was set to initialResolution beforehand)
             * @param {boolean} [params.categoryName=idPart] if set, will be used to search for the category label; else, idPart is used
             * @param {String} params.searchKey String that is searched for.
             * @param {boolean} params.idPart part of the id for hits sufficient for identifying it
             * @returns {void}
             */
            async function selectAndVerifyFirstHit ({setsMarker, showsPolygon, movesCenter, changesResolution, categoryName, idPart, searchKey}) {
                const categorySelector = By.xpath(`//li[contains(@class,'type')][contains(text(),'${categoryName || idPart}')]`),
                    categoryOpenSelector = By.xpath(`//li[contains(@class,'type')][contains(@class,'open')][contains(text(),'${categoryName || idPart}')]`),
                    entrySelector = By.xpath(`//li[contains(@id,'${idPart}')][contains(@class,'hit')]`);
                let marker = null,
                    elList = null,
                    lastElement = null;


                if (setsMarker) {
                    marker = "markerPoint";
                }
                else if (showsPolygon) {
                    marker = "markerPolygon";
                }

                await reopenCategories(searchKey);

                await driver.wait(until.elementLocated(categorySelector), 12000);
                await driver.wait(until.elementIsVisible(await driver.findElement(categorySelector)), 12000);

                /** sometimes needs another click to really open; retry after 100ms if it didn't work */
                do {
                    await (await driver.findElement(categorySelector)).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(categoryOpenSelector)).length === 0);

                elList = await driver.findElements(entrySelector);
                lastElement = elList[elList.length - 1];

                await driver.wait(until.elementIsVisible(await lastElement), 12000);
                await lastElement.click();

                if (movesCenter) {
                    await driver.wait(async () => initialCenter !== await driver.executeScript(getCenter), 12000);
                }
                if (changesResolution) {
                    await driver.wait(async () => initialResolution !== await driver.executeScript(getResolution), 12000);
                }

                await driver.wait(async () => driver.executeScript(hasVectorLayerLength, marker, marker !== null ? 1 : 0), 9000);
            }

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await getDriver();
                await init();
            });

            /**
             * provides some elements
             * @returns {void}
             */
            async function init () {
                const searchInputSelector = By.css("#searchInput");

                await driver.wait(until.elementLocated(searchInputSelector));
                searchInput = await driver.findElement(searchInputSelector);
                searchList = await driver.findElement(By.css("#searchInputUL"));
                clear = await driver.findElement(By.css("#searchbar span.x-icon"));
                initialCenter = await driver.executeScript(getCenter);
                initialResolution = await driver.executeScript(getResolution);
            }

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
                    await init();
                }
            });

            it("searches show some results in a dropdown", async function () {
                await driver.wait(until.elementLocated(By.id("searchInput")), 12000);
                if (await (await driver.findElement(By.id("searchInput"))).getAttribute("value") === "") {
                    await searchInput.sendKeys(searchString);
                }

                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#searchInputUL"))));
                expect(await driver.findElements(By.css("#searchInputUL > li.hit"))).to.have.length(5);
                expect(await driver.findElements(By.css("#searchInputUL > li.results"))).to.have.length(1);
            });

            (isChrome(browsername) ? it : it.skip)("provides all results aggregated by categories, including sum of hits per category", async function () {
                if (await (await driver.findElement(By.id("searchInput"))).getAttribute("value") === "") {
                    await searchInput.sendKeys(searchString);
                }
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#searchInputUL > li.list-group-item"))), 5000);
                await (await driver.findElement(By.css("#searchInputUL > li.list-group-item"))).click();
                expect(await driver.findElements(By.css("#searchInputUL > li.list-group-item.type > span.badge"))).to.not.equals(0);
            });

            it("category 'festgestellt' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "festgestellt"
                });

                expect(await driver.executeScript(hasVectorLayerStyle, "markerPolygon", {
                    fill: {color: [8, 119, 95, 0.3]},
                    stroke: {color: [8, 119, 95, 1]}
                })).to.be.true;
            });

            it("category 'im Verfahren' shows results; on click, zooms to the place and marks it with polygon", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: false,
                    showsPolygon: true,
                    movesCenter: true,
                    idPart: "im Verfahren",
                    searchKey: "Heim"
                });

                expect(await driver.executeScript(hasVectorLayerStyle, "markerPolygon", {
                    fill: {color: [8, 119, 95, 0.3]},
                    stroke: {color: [8, 119, 95, 1]}
                })).to.be.true;
            });

            // NOTE using this instead of 'Krankenhaus' since I can't find the KH search
            it("category 'Kita' shows results; on click, zooms to the place and marks it with a marker", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    idPart: "Kita"
                });
            });

            it("category 'Straße' shows results; on click, zooms to the place, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    changesResolution: true,
                    idPart: "Straße",
                    searchKey: "repel"
                });
            });

            it("category 'Stadtteil' shows results; on click, zooms to the place and marks it with a marker, changes resolution", async function () {
                await selectAndVerifyFirstHit({
                    setsMarker: true,
                    showsPolygon: false,
                    movesCenter: true,
                    changesResolution: true,
                    idPart: "Stadtteil",
                    searchKey: "Altona"
                });
            });

            it("remove searchbar input", async function () {
                await driver.wait(until.elementLocated(By.id("searchInput")), 12000);
                await (await driver.findElement(By.css("#searchInput"))).clear();

                expect(await (await driver.findElement(By.id("searchInput"))).getAttribute("value")).to.equals("");
            });
        });
    }
}

module.exports = SearchCategories;
