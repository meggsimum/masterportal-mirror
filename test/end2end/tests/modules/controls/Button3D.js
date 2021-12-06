const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {/* clickFeature,*/ logTestingCloudUrlToTest} = require("../../../library/utils"),
    {getCenter, getTilt, getResolution, getHeading, setTilt, setCenter} = require("../../../library/scripts"),
    {isMaster, isCustom, isDefault, is2D, isMobile} = require("../../../settings"),
    {Button, By, until} = webdriver;

/**
 * 3D Mode tests. Please note that search, control, and tool tests for 3D mode are mostly
 * within their respective test files that are also run in 3D mode. In this file, only
 * elements and functions that only exist within 3D mode are tested.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
function Button3DTests ({builder, url, resolution, mode, capability}) {
    /* only run tests in
     * - non-mobile mode (does not have 3D mode)
     * - 2D mode, because de-/activating 3D is part of this test (3D mode is for rerunning other tools/search/... tests in 3D)
     * - default, custom, master (have 3d mode)
     */
    const skipAll = isMobile(resolution) ||
        !is2D(mode) ||
        // !(isDefault(url) || isCustom(url) || isMaster(url)),
        !(isDefault(url) || isMaster(url)),
        testViews = isMaster(url); // views only defined in master

    if (!skipAll) {
        // TODO 3D mode tests are currently skipped and need to be re-worked to work with the new configurations
        describe("Modules Controls Button3D", function () {
            let driver, button3D, tiltDown, tiltUp, zoomInButton, zoomOutButton, north, east, south, west, northPointer;

            before(async function () {
                if (capability) {
                    capability.name = this.currentTest.fullTitle();
                    capability["sauce:options"].name = this.currentTest.fullTitle();
                    builder.withCapabilities(capability);
                }
                driver = await initDriver(builder, url, resolution);
                await init();
            });

            /**
             * only for default url: activate a layer for later testing whether it remains active - other portals have layers active initially
             * @returns {void}
             */
            async function init () {
                await driver.wait(until.elementLocated(By.css("#button3D")), 5000);
                button3D = await driver.findElement(By.css("#button3D"));

                if (isDefault(url)) {
                    await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                    await (await driver.findElement(By.css(".Overlayer > .bootstrap-icon"))).click();
                    await (await driver.findElement(By.xpath("//*[contains(@id,'Gesundheit')]/*[contains(@class,'bootstrap-icon')]"))).click();
                    await (await driver.findElement(By.css("li.layer .bi-square"))).click();
                    await (await driver.findElement(By.css(".Overlayer > .bootstrap-icon"))).click();
                    await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                }
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
                    console.warn("      FAILED! Retrying test \"" + this.currentTest.title + "\"  after reloading url");
                    driver = await initDriver(builder, url, resolution, null, true);
                    await init();
                    await driver.executeScript(setCenter, [566199.8456237861, 5934751.631548104], 8);
                    await button3D.click();
                    await driver.wait(until.elementLocated(By.css("#orientation3d")), 5000);
                }
                /* add some cooldown time per test to avoid overlaps;
                * would be nicer with awaits, but what could we wait for? */
                await driver.wait(new Promise(r => setTimeout(r, 10000)));
            });

            it("button3D press activates 3D mode and 3D mode UI", async function () {
                await driver.executeScript(setCenter, [566199.8456237861, 5934751.631548104], 7);
                await button3D.click();
                await driver.wait(until.elementLocated(By.css("#orientation3d")), 5000);

                tiltDown = await driver.findElement(By.css("#orientation3d .control-box-container #tilt-down"));
                tiltUp = await driver.findElement(By.css("#orientation3d .control-box-container #tilt-up"));
                zoomInButton = await driver.findElement(By.css("#orientation3d .control-box-container #zoom-in"));
                zoomOutButton = await driver.findElement(By.css("#orientation3d .control-box-container #zoom-out"));
                north = await driver.findElement(By.css("#orientation3d .compass #compass_north"));
                east = await driver.findElement(By.css("#orientation3d .compass #compass_east"));
                south = await driver.findElement(By.css("#orientation3d .compass #compass_south"));
                west = await driver.findElement(By.css("#orientation3d .compass #compass_west"));
                northPointer = await driver.findElement(By.css("#orientation3d .compass #north-pointer"));
            });

            it("3D mode UI compass arrows shift view", async function () {
                const centers = [await driver.executeScript(getCenter)];
                let prevCenter, nextCenter;

                for (const direction of [north, east, south, west]) {
                    prevCenter = centers[centers.length - 1];
                    await direction.click();
                    do {
                        nextCenter = await driver.executeScript(getCenter);
                    } while (nextCenter[0] === prevCenter[0] && nextCenter[1] === prevCenter[1]);
                    centers.push(nextCenter);
                }
                expect(centers[1][1]).to.be.above(centers[0][1]); // moved north
                expect(centers[2][0]).to.be.above(centers[1][0]); // moved east
                expect(centers[3][1]).to.be.below(centers[2][1]); // moved south
                expect(centers[4][0]).to.be.below(centers[3][0]); // moved west
            });

            it("3D mode UI tilting buttons tilt view", async function () {
                const initialTilt = await driver.executeScript(getTilt);

                await tiltDown.click();
                await driver.wait(async () => initialTilt < await driver.executeScript(getTilt), 5000, "Tilting down did not change angle.");

                await tiltUp.click();
                await driver.wait(async () => initialTilt - await driver.executeScript(getTilt) < 0.0001, 5000, "Tilting up after tilting down did not restore angle.");
            });

            it("3D mode UI zoom in button zoom view", async function () {
                const initialResolution = await driver.executeScript(getResolution);

                await zoomInButton.click();
                expect(initialResolution > await driver.executeScript(getResolution)).to.be.true;
            });

            it("3D mode UI zoom out button zoom view", async function () {
                const initialResolution = await driver.executeScript(getResolution);


                await zoomOutButton.click();
                expect(await driver.executeScript(getResolution) > initialResolution).to.be.true;
            });

            it("3D mode UI N button rotates on drag", async function () {
                // value is very small, but never exactly 0
                const initialHeading = await driver.executeScript(getHeading);

                await driver.actions()
                    .dragAndDrop(northPointer, {x: -5, y: 0})
                    .perform();

                expect(await driver.executeScript(getHeading)).to.not.be.closeTo(initialHeading, 0.00001);
            });

            it("3D mode UI N button norths on click", async function () {
                // restore northing
                await northPointer.click();
                expect(0).to.be.closeTo(await driver.executeScript(getHeading), 0.00001);
            });

            it("3D mode allows tilting the view with held mouse wheel", async function () {
                const initialTilt = await driver.executeScript(getTilt);

                await driver.actions({bridge: true})
                    .move({origin: await driver.findElement(By.css(".ol-viewport"))})
                    .press(Button.MIDDLE)
                    .move({x: 10, y: 30})
                    .release(Button.MIDDLE)
                    .perform();

                await driver.wait(async () => initialTilt < await driver.executeScript(getTilt), 50000, "Tilting up with mouse wheel did not work.");

                // restore northing & tilt
                await northPointer.click();
                await driver.executeScript(setTilt, 0.1);
            });

            if (testViews) {
                it("on choosing a pre-defined view, it will zoom to the defined coordinates and also use the tilt value", async function () {
                    await (await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))).click();
                    await (await driver.findElement(By.xpath("//ul[@id='ansichten']//a[contains(.,'Ansicht 1')]"))).click();
                    await (await driver.findElement(By.xpath("//span[contains(.,'Ansichten')]"))).click();

                    // tilt varies a little - assume this is fine, hence .closeTo suffices
                    expect(await driver.executeScript(getTilt)).to.be.closeTo(0.9321791580603296, 0.01);
                    // NOTE center varies from config and U-Bahn Feldstraße is visible, but not centered - leaving this to crash, looks wrong
                    // NOTE the module needs to be fixed first, center koordinate is not the same as in config
                    // expect(await driver.executeScript(getCenter)).to.deep.equal([564068.2339495212, 5934685.749309047]);
                });
            }

            it("3D mode has 3D mode specific layers initially active", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                // previously selected layer stays open
                if (isDefault(url) || isCustom(url)) {
                    await driver.findElement(By.xpath("//div[contains(@class, 'SelectedLayer')]//span//i[contains(@class, 'bi-plus-circle-fill')]")).click();
                    await driver.findElement(By.xpath("//ul[@id='SelectedLayer']//span[contains(.,'Krankenhäuser')]"));
                    await driver.findElement(By.xpath("//div[contains(@class, 'SelectedLayer')]//span//i[contains(@class, 'bi-dash-circle-fill')]")).click();
                    // await (await driver.findElement(By.xpath("//ul[@id='tree']/li[2]/div/span"))).click();
                }
                else {
                    await driver.findElement(By.xpath("//span[contains(.,'Krankenhäuser')]"));
                }
                // "Gelände" and "Gebäude LoD2" are initially active
                await driver.findElement(By.xpath("//*[text()='Gelände' or text()='Gelaende']"));
                await driver.findElement(By.xpath("//span[contains(.,'Gebäude LoD2')]"));
                // close tree
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
            });

            it("3D mode tools are restricted to those worked in 3D mode", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))).click();

                // tools without 3D compatibility are gone
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Karte Drucken')]"))));
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Datei-Import')]"))));
                await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Zeichnen / Schreiben')]"))));

                // // tools with 3D compatibility are shown
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Flurstückssuche')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Strecke / Fläche messen')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Informationen abfragen')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Koordinaten abfragen')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Koordinatensuche')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Auswahl speichern')]"))));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Schatten')]"))));

                await (await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))).click();
            });

            it("3D mode layer objects show gfi on click", async function () {
                const viewport = await driver.findElement(By.css(".ol-viewport"));
                let tries = 0;

                await driver.executeScript(setCenter, [566699.8456237861, 5934251.631548104], 4);

                // 3D layer may load some time; give it a few retries
                do {
                    await driver.wait(new Promise(r => setTimeout(r, 1000)));
                    await viewport.click();
                    tries++;
                } while (tries < 10 && (await driver.findElements(By.css("div.gfi"))).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(.,'Gebäude')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Bahnhofsgebäude')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Flachdach')]"))).to.exist;
                await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span//i[contains(@class, 'bi-x-lg')]"))).click();
            });

            // it("in 3D mode, 2D layer features still show gfi on click", async function () {
            //     // NOTE fix wfs in 3d first, then try this test again.
            //     // NOTE this test usually fails and layer contents look distorted even in flat view from above - WFS issue in 3D mode?
            //     await clickFeature(driver, [552390.5395515135, 5935385.6774624]);

            //     await driver.wait(until.elementLocated(By.css("div.gfi")), 5000);
            //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
            //     expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Krankenhaus Tabea')]"))).to.exist;
            //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span//i[contains(@class, 'bi-x-lg')]"))).click();
            //     await driver.wait(until.elementIsNotVisible(await driver.findElement(By.css("div.gfi"))));
            // });

            describe("clicking 3D button again deactivates 3D mode", function () {
                it("3D layer layers are no longer in layer tree; others are kept", async function () {
                    await (await driver.findElement(By.css("#button3D"))).click();

                    await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                    // previously selected layer stays open
                    if (isDefault(url) || isCustom(url)) {
                        await driver.findElement(By.xpath("//div[contains(@class, 'SelectedLayer')]//span//i[contains(@class, 'bi-plus-circle-fill')]")).click();
                        await driver.findElement(By.xpath("//ul[@id='SelectedLayer']//span[contains(.,'Krankenhäuser')]"));
                        await driver.findElement(By.xpath("//div[contains(@class, 'SelectedLayer')]//span//i[contains(@class, 'bi-dash-circle-fill')]")).click();
                        await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//ul[@id='tree']/li[2]"))));
                    }
                    else {
                        await driver.findElement(By.xpath("//span[contains(.,'Krankenhäuser')]"));
                        await driver.findElement(By.xpath("//span[contains(.,'Geobasiskarten')]"));
                    }
                    // "Gelände" and "Gebäude LoD2" are not longer visible
                    await driver.findElement(By.xpath("//*[text()='Gelände' or text()='Gelaende']"));
                    await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//span[contains(.,'Gebäude LoD2')]"))));
                    // expect(await driver.findElements(By.css("ul#SelectedLayer li:nth-child(3)"))).to.be.empty;
                    await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                });

                it("3D tools no longer available; 2D-only tools available again", async function () {
                    await (await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))).click();
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Karte Drucken')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Datei-Import')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Zeichnen / Schreiben')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Flurstückssuche')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Strecke / Fläche messen')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Informationen abfragen')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Koordinaten abfragen')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Koordinatensuche')]"))));
                    await driver.wait(until.elementIsVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Auswahl speichern')]"))));
                    await driver.wait(until.elementIsNotVisible(await driver.findElement(By.xpath("//ul[@id='tools']//a[contains(.,'Schatten')]"))));
                    await (await driver.findElement(By.xpath("//span[contains(.,'Werkzeuge')]"))).click();
                });
            });
        });
    }
}

module.exports = Button3DTests;
