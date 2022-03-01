// filename: test/BasePageSpec.js
require("./spec_helper");
const assert = require("assert");
const {expect} = require("chai");
const BasePage = require("../pages/BasePage");

describe("URL Query Parameters", function () {
    const BUTTON_3D = {id: "button3D"},
        COMPASS_NORTH_POINTER = {id: "north-pointer"};

    let basePage;

    beforeEach(async function () {
        basePage = new BasePage(this.driver);
    });

    it("?Map/mapMode=2D shall start in 2D-mode @deep", async function () {
        await basePage.load("?Map/mapMode=2D");
        await basePage.isDisplayed(BUTTON_3D, 5000);
        const button = basePage.find(BUTTON_3D);

        expect(button.getText()).to.equals("3D");
    });
    it("?Map/mapMode=3D shall start in 3D-mode @basic", async function () {
        await basePage.load("?Map/mapMode=3D");
        await basePage.isDisplayed(COMPASS_NORTH_POINTER, 5000);
        const button = basePage.find(COMPASS_NORTH_POINTER);

        expect(button).to.exist();
    });
    // it("?Map/mapMode=3D&heading=-1.2502079000000208 test shall start in 3D-mode and shall set heading", async function () {
    //     await loadUrl(driver, `${url}?Map/mapMode=3D&heading=-1.2502079000000208`, mode);
    //     await driver.wait(until.elementLocated(By.css("#north-pointer")), 5000);
    //     expect(await driver.findElement(By.css("#north-pointer"))).to.exist;
    //     // get3DHeading
    //     const heading = await driver.executeScript(get3DHeading);

    //     expect(-1.2502079000000208).to.eql(heading);
    // });
    // it("?Map/mapMode=3D&tilt=45 test shall start in 3D-mode and shall set tilt", async function () {
    //     await loadUrl(driver, `${url}?Map/mapMode=3D&tilt=45`, mode);
    //     await driver.wait(until.elementLocated(By.css("#north-pointer")), 5000);
    //     expect(await driver.findElement(By.css("#north-pointer"))).to.exist;
    //     // get3DHeading
    //     const tilt = await driver.executeScript(get3DTilt);

    //     expect(45).to.eql(tilt);
    // });
    // it("?Map/mapMode=3D&altitude=127 test shall start in 3D-mode and shall set altitude", async function () {
    //     await loadUrl(driver, `${url}?Map/mapMode=3D&altitude=127`, mode);
    //     await driver.wait(until.elementLocated(By.css("#north-pointer")), 5000);
    //     expect(await driver.findElement(By.css("#north-pointer"))).to.exist;

    //     const altitude = await driver.executeScript(get3DAltitude);

    //     expect(altitude).to.be.closeTo(127, 3);
    // });
    // it("?Map/projection=EPSG:8395&Map/center=[3565836,5945355] test with center", async function () {
    //     let center = null;

    //     await loadUrl(driver, `${url}?Map/projection=EPSG:8395&Map/center=[3565836,5945355]`, mode);
    //     center = await driver.executeScript(getCenter);
    //     center = center.map(d => {
    //         return Math.round(d);
    //     });
    //     expect([565810, 5942977]).to.eql(center);
    // });
    // it("?MapMarker test with coordinates as array or as string", async function () {
    //     let coord;

    //     await loadUrl(driver, `${url}?MapMarker=[565874,5934140]`, mode);
    //     coord = await driver.executeScript(getMarkerPointCoord);
    //     expect([565874, 5934140]).to.eql(coord);

    //     await loadUrl(driver, `${url}?MapMarker=572299,5926885`, mode);
    //     coord = await driver.executeScript(getMarkerPointCoord);
    //     expect([572299, 5926885]).to.eql(coord);

    // });
    // it("?Map/zoomToExtent test", async function () {
    //     const extentData = [550761, 5927012, 580987, 5941268];

    //     await loadUrl(driver, `${url}?Map/zoomToExtent=${extentData.join(",")}`, mode);

    //     let extent = await driver.executeScript(getExtent);

    //     extent = extent.map(d => {
    //         return Math.round(d);
    //     });

    //     expect(extentData[0]).to.be.at.least(extent[0]);
    //     expect(extentData[1]).to.be.at.least(extent[1]);
    //     expect(extentData[2]).to.be.at.most(extent[2]);
    //     expect(extentData[3]).to.be.at.most(extent[3]);

    // });
    // it("?lng=en starts masterportal in english", async function () {
    //     await loadUrl(driver, `${url}?lng=en`, mode);

    //     // language-bar
    //     await driver.wait(until.elementLocated(By.css("#language-bar")), 5000);
    //     expect(await (await driver.findElement(By.className("current-language"))).getText()).to.equals("EN");

    // });
    // it("?style=simple hides control elements", async function () {
    //     await loadUrl(driver, `${url}?style=simple`, mode);

    //     await driver.wait(until.elementIsNotVisible(driver.findElement(By.id("main-nav"))), 10000);
    //     expect(await driver.findElements(By.className("ol-viewport"))).to.not.be.empty;
    //     expect(await driver.findElements(By.className("mouse-position"))).to.be.empty;
    //     expect(await driver.findElements(By.className("top-controls"))).to.be.empty;
    //     expect(await driver.findElements(By.className("bottom-controls"))).to.be.empty;
    // });
    // it("?uiStyle=simple hides control elements", async function () {
    //     await loadUrl(driver, `${url}?uiStyle=simple`, mode);

    //     await driver.wait(until.elementIsNotVisible(driver.findElement(By.id("main-nav"))), 10000);
    //     expect(await driver.findElements(By.className("ol-viewport"))).to.not.be.empty;
    //     expect(await driver.findElements(By.className("mouse-position"))).to.be.empty;
    //     expect(await driver.findElements(By.className("top-controls"))).to.be.empty;
    //     expect(await driver.findElements(By.className("bottom-controls"))).to.be.empty;
    // });

    // it("?center= allows setting coordinates of map", async function () {
    //     await loadUrl(driver, `${url}?center=566499,5942803`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

    //     const center = await driver.executeScript(getCenter);

    //     expect([566499, 5942803]).to.eql(center);
    // });
    // it("?center= allows setting array of coordinates of map", async function () {
    //     await loadUrl(driver, `${url}?center=[566499,5942803]`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

    //     const center = await driver.executeScript(getCenter);

    //     expect([566499, 5942803]).to.eql(center);
    // });
    // it("?Map/center= allows setting array of coordinates of map", async function () {
    //     await loadUrl(driver, `${url}?Map/center=[566499,5942803]`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 10000);

    //     const center = await driver.executeScript(getCenter);

    //     expect([566499, 5942803]).to.eql(center);
    // });

    // it("?zoomtogeometry=[number] zooms to a district", async function () {
    //     const expectedCoordinate = [556535.269, 5937846.413000001];

    //     // Bezirk 1 is Altona according to portal/master/config.js listing
    //     await loadUrl(driver, `${url}?zoomtogeometry=1`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     expect(await centersTo(driver, expectedCoordinate)).to.be.true;
    // });

    // it("deprecated - ?bezirk=[districtName] zooms to a district", async function () {
    //     const expectedCoordinate = [578867.787, 5924175.483999999];

    //     await loadUrl(driver, `${url}?bezirk=bergedorf`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     expect(await centersTo(driver, expectedCoordinate)).to.be.true;
    // });

    // it("?Map/zoomToGeometry=[number] zooms to a district", async function () {
    //     const expectedCoordinate = [556535.269, 5937846.413000001];

    //     // Bezirk 1 is Altona according to portal/master/config.js listing
    //     await loadUrl(driver, `${url}?Map/zoomToGeometry=1`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     expect(await centersTo(driver, expectedCoordinate)).to.be.true;
    // });

    // it("?zoomlevel= sets the chosen zoom level", async function () {
    //     await loadUrl(driver, `${url}?zoomlevel=8`, mode);

    //     expect(0.2645831904584105).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:1.000
    // });

    // it("?Map/zoomLevel= sets the chosen zoom level", async function () {
    //     await loadUrl(driver, `${url}?Map/zoomLevel=8`, mode);

    //     expect(0.2645831904584105).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:1.000
    // });

    // it("?isinitopen= allows opening tools initially in window", async function () {
    //     const toolName = "fileimport",
    //         toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?isinitopen=${toolName}`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });
    // it("?isinitopen=kmlimport opens fileimport in window", async function () {
    //     const toolName = "kmlimport",
    //         toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?isinitopen=${toolName}`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("deprecated - ?startupmodul= allows opening tools initially in window", async function () {
    //     const toolName = "fileimport",
    //         toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?startupmodul=${toolName}`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?Tools/Measure/active=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?Tools/Measure/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?tools/coordToolkit/active=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?tools/coordToolkit/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?tools/measure/active=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?tools/measure/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?Measure/active=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?Measure/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?coordtoolkit/active=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?coordtoolkit/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?Measure/active allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?Measure/active`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?measure/active allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?measure/active`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?Measure=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?Measure=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?measure=true allows opening tools initially in window", async function () {
    //     const toolwindow = By.css(".tool-window-vue");

    //     await loadUrl(driver, `${url}?measure=true`, mode);
    //     await driver.wait(until.elementLocated(toolwindow), 5000);
    //     expect(await driver.findElement(toolwindow)).to.exist;
    // });

    // it("?isinitopen= allows opening tools initially in sidebar", async function () {
    //     const toolName = "draw",
    //         toolSidebar = By.css("#tool-sidebar-vue");

    //     await loadUrl(driver, `${url}?isinitopen=${toolName}`, mode);
    //     await driver.wait(until.elementLocated(toolSidebar), 5000);
    //     expect(await driver.findElement(toolSidebar)).to.exist;
    // });
    // it("?Tools/Draw/active=true allows opening tools initially in sidebar", async function () {
    //     const toolSidebar = By.css("#tool-sidebar-vue");

    //     await loadUrl(driver, `${url}?Tools/Draw/active=true`, mode);
    //     await driver.wait(until.elementLocated(toolSidebar), 5000);
    //     expect(await driver.findElement(toolSidebar)).to.exist;
    // });

    // it("?layerids=, &visibility=, and &transparency= work together to display a layer in tree and map as configured", async function () {
    //     // 2426 is "Bezirke"
    //     await loadUrl(driver, `${url}?layerids=2426&visibility=true&transparency=0`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);

    //     const treeEntry = await driver.findElement(
    //             isBasic(url) || isMaster(url)
    //                 ? By.xpath("//ul[@id='tree']/li[.//span[@title='Bezirke'] and .//span[contains(@class,'glyphicon-check')]]")
    //                 : By.css("#SelectedLayer .layer-item [title=\"Bezirke\"]")
    //         ),
    //         visible = await driver.executeScript(isLayerVisible, "2426", "1");

    //     expect(treeEntry).to.exist;
    //     expect(visible).to.be.true;
    // });

    // it("?Map/layerids=, &visibility=, and &transparency= work together to display a layer in tree and map as configured", async function () {
    //     // 2426 is "Bezirke"
    //     await loadUrl(driver, `${url}?Map/layerids=2426&visibility=true&transparency=0`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);

    //     const treeEntry = await driver.findElement(
    //             isBasic(url) || isMaster(url)
    //                 ? By.xpath("//ul[@id='tree']/li[.//span[@title='Bezirke'] and .//span[contains(@class,'glyphicon-check')]]")
    //                 : By.css("#SelectedLayer .layer-item [title=\"Bezirke\"]")
    //         ),
    //         visible = await driver.executeScript(isLayerVisible, "2426", "1");

    //     expect(treeEntry).to.exist;
    //     expect(visible).to.be.true;
    // });

    // it("?layerIDs=, &visibility=, and &transparency= allow configuring multiple layers and work with &center= and &zoomlevel=", async function () {
    //     let ortho = "";

    //     // 2426 is "Bezirke"
    //     // 452 is "Digitale Orthophotos (belaubt) Hamburg || Luftbilder DOP 20 (DOP 40 mit Umland)"
    //     await loadUrl(driver, `${url}?layerIDs=452,2426&visibility=true,true&transparency=40,20&center=560478.8,5937293.5&zoomlevel=3`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);

    //     if (isBasic(url) || isMaster(url)) {
    //         ortho = "ul#tree li [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
    //     }
    //     else if (isDefault(url)) {
    //         ortho = "#SelectedLayer .layer-item [title^=\"Luftbilder DOP 20 (DOP 40 mit Umland)\"]";
    //     }
    //     else {
    //         ortho = "#SelectedLayer .layer-item [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
    //     }

    //     const treeEntryLuftbilder = await driver.findElement(By.css(ortho)),
    //         treeEntryBezirke = await driver.findElement(By.css(
    //             isBasic(url) || isMaster(url)
    //                 ? "ul#tree li [title=\"Bezirke\"]"
    //                 : "#SelectedLayer .layer-item [title=\"Bezirke\"]"
    //         )),
    //         luftbilderVisible = await driver.executeScript(isLayerVisible, "452", "0.6"),
    //         bezirkeVisible = await driver.executeScript(isLayerVisible, "2426", "0.8");

    //     expect(treeEntryLuftbilder).to.exist;
    //     expect(treeEntryBezirke).to.exist;
    //     expect(luftbilderVisible).to.equal(true);
    //     expect(bezirkeVisible).to.equal(true);
    //     expect(await driver.executeScript(areLayersOrdered, ["452", "2426"])).to.be.true;
    //     expect([560478.8, 5937293.5]).to.eql(await driver.executeScript(getCenter));
    //     expect(10.58332761833642).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:40.000
    // });

    // it("?Map/layerIDs=, &visibility=, and &transparency= allow configuring multiple layers and work with &center= and &zoomlevel=", async function () {
    //     let ortho = "";

    //     // 2426 is "Bezirke"
    //     // 452 is "Digitale Orthophotos (belaubt) Hamburg || Luftbilder DOP 20 (DOP 40 mit Umland)"
    //     await loadUrl(driver, `${url}?Map/layerIDs=452,2426&visibility=true,true&transparency=40,20&center=560478.8,5937293.5&zoomlevel=3`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);

    //     if (isBasic(url) || isMaster(url)) {
    //         ortho = "ul#tree li [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
    //     }
    //     else if (isDefault(url)) {
    //         ortho = "#SelectedLayer .layer-item [title^=\"Luftbilder DOP 20 (DOP 40 mit Umland)\"]";
    //     }
    //     else {
    //         ortho = "#SelectedLayer .layer-item [title^=\"Digitale Orthophotos (belaubt) Hamburg\"]";
    //     }

    //     const treeEntryLuftbilder = await driver.findElement(By.css(ortho)),
    //         treeEntryBezirke = await driver.findElement(By.css(
    //             isBasic(url) || isMaster(url)
    //                 ? "ul#tree li [title=\"Bezirke\"]"
    //                 : "#SelectedLayer .layer-item [title=\"Bezirke\"]"
    //         )),
    //         luftbilderVisible = await driver.executeScript(isLayerVisible, "452", "0.6"),
    //         bezirkeVisible = await driver.executeScript(isLayerVisible, "2426", "0.8");

    //     expect(treeEntryLuftbilder).to.exist;
    //     expect(treeEntryBezirke).to.exist;
    //     expect(luftbilderVisible).to.equal(true);
    //     expect(bezirkeVisible).to.equal(true);
    //     expect(await driver.executeScript(areLayersOrdered, ["452", "2426"])).to.be.true;
    //     expect([560478.8, 5937293.5]).to.eql(await driver.executeScript(getCenter));
    //     expect(10.58332761833642).to.be.closeTo(await driver.executeScript(getResolution), 0.000000001); // equals 1:40.000
    // });

    // it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - KiTa layer GFI with example 'KiTa Im Volkspark' shows gfi", async function () {
    //     const paramUrl = `${url}/?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`;
    //     let counter = 0;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     do {
    //         expect(counter++).to.be.below(25);
    //         await clickFeature(driver, [559308.323, 5937846.748]);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'KiTa Im Volkspark')]")), 12000);
    //     await driver.actions({bridge: true})
    //         .dragAndDrop(
    //             await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
    //             await driver.findElement(By.css("html"))
    //         )
    //         .perform();
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
    // });

    // it("?Map/layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - KiTa layer GFI with example 'KiTa Im Volkspark' shows gfi", async function () {
    //     const paramUrl = `${url}/?Map/layerIDs=4736,myId2&visibility=true,true&transparency=0,0`;
    //     let counter = 0;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     do {
    //         expect(counter++).to.be.below(25);
    //         await clickFeature(driver, [559308.323, 5937846.748]);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'KiTa Im Volkspark')]")), 12000);
    //     await driver.actions({bridge: true})
    //         .dragAndDrop(
    //             await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
    //             await driver.findElement(By.css("html"))
    //         )
    //         .perform();
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
    // });

    // it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - hospital layer GFI with example 'Agaplesion Diakonieklinikum Hamburg' shows gfi", async function () {
    //     const paramUrl = `${url}/?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`;
    //     let counter = 0;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     do {
    //         expect(counter++).to.be.below(25);
    //         await clickFeature(driver, [564033.59, 5935952.15]);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Agaplesion Diakonieklinikum Hamburg')]")), 12000);
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
    // });

    // it("?Map/layerids=, &visibility=, and &transparency= have working gfi/legend/info - hospital layer GFI with example 'Agaplesion Diakonieklinikum Hamburg' shows gfi", async function () {
    //     const paramUrl = `${url}/?Map/layerids=4736,myId2&visibility=true,true&transparency=0,0`;
    //     let counter = 0;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     do {
    //         expect(counter++).to.be.below(25);
    //         await clickFeature(driver, [564033.59, 5935952.15]);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Agaplesion Diakonieklinikum Hamburg')]")), 12000);
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);
    // });

    // it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - both layers have their respective legend loaded", async function () {
    //     const paramUrl = `${url}/?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))));

    //     // wait until content of legend window is loaded
    //     await driver.wait(new Promise(r => setTimeout(r, 500)));
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=KitaEinrichtungen')]"))).to.exist;
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=krankenhaeuser')]"))).to.exist;
    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);
    // });

    // it("?Map/layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - both layers have their respective legend loaded", async function () {
    //     const paramUrl = `${url}/?Map/layerIDs=4736,myId2&visibility=true,true&transparency=0,0`;

    //     if (await driver.getCurrentUrl() !== paramUrl) {
    //         await loadUrl(driver, paramUrl, mode);
    //     }

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))));

    //     // wait until content of legend window is loaded
    //     await driver.wait(new Promise(r => setTimeout(r, 500)));
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=KitaEinrichtungen')]"))).to.exist;
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=krankenhaeuser')]"))).to.exist;
    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);
    // });

    // it("?layerIDs=, &visibility=, and &transparency= have working gfi/legend/info - layers are shown in the topic tree and present layer information", async function () {
    //     await loadUrl(driver, `${url}?layerIDs=4736,myId2&visibility=true,true&transparency=0,0`, mode);
    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tree"))));
    //     await (await driver.findElement(By.css("li.layer span.glyphicon-info-sign"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("layerInformation"))));

    //     expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
    // });

    // it("?Map/layerids=, &visibility=, and &transparency= have working gfi/legend/info - layers are shown in the topic tree and present layer information", async function () {
    //     await loadUrl(driver, `${url}?Map/layerids=4736,myId2&visibility=true,true&transparency=0,0`, mode);
    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tree"))));
    //     await (await driver.findElement(By.css("li.layer span.glyphicon-info-sign"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("layerInformation"))));

    //     expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
    // });

    // it("?layerIDs=, &visibility=, and &transparency= with set zoom level have working gfi/legend/info", async function () {
    //     await loadUrl(driver, `${url}?layerIDs=4736,4537&visibility=true,true&transparency=0,0&zoomLevel=6`, mode);
    //     const coords = [566688.25, 5934320.50];

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     // test hospital layer GFI with example "Hamburg Hauptbahnhof" at coords "566688.25, 5934320.50"
    //     do {
    //         await clickFeature(driver, coords);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//h6[contains(.,'Steintorwall 20')]"))).to.exist;
    //     await driver.actions({bridge: true})
    //         .dragAndDrop(
    //             await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
    //             await driver.findElement(By.css("html"))
    //         )
    //         .perform();
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);

    //     // check whether layer has its legend loaded
    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))), 12000);
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geoportal-hamburg.de/legende/legende_solar.png')]"))).to.exist;
    //     await (await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);

    //     // check layer information in topic tree
    //     await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tree"))));
    //     await (await driver.findElement(By.xpath("//ul[@id='tree']/li[.//span[@title='Eignungsflächen']]//span[contains(@class,'glyphicon-info-sign')]"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("layerInformation"))));

    //     expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
    // });

    // it("?Map/layerids=, &visibility=, and &transparency= with set zoom level have working gfi/legend/info", async function () {
    //     await loadUrl(driver, `${url}?Map/layerids=4736,4537&visibility=true,true&transparency=0,0&zoomLevel=6`, mode);
    //     const coords = [566688.25, 5934320.50];

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     // test hospital layer GFI with example "Hamburg Hauptbahnhof" at coords "566688.25, 5934320.50"
    //     do {
    //         await clickFeature(driver, coords);
    //         await driver.wait(new Promise(r => setTimeout(r, 100)));
    //     } while ((await driver.findElements(By.css("div.gfi"))).length === 0);

    //     await driver.wait(until.elementLocated(By.css("div.gfi")), 12000);
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))), 12000);
    //     expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//h6[contains(.,'Steintorwall 20')]"))).to.exist;
    //     await driver.actions({bridge: true})
    //         .dragAndDrop(
    //             await driver.findElement(By.css(".gfi .tool-window-vue .tool-window-heading .basic-drag-handle")),
    //             await driver.findElement(By.css("html"))
    //         )
    //         .perform();
    //     await (await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.gfi"))).length).to.equal(0);

    //     // check whether layer has its legend loaded
    //     await (await driver.findElement(By.css(".legend-menu-item"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.legend-window"))), 12000);
    //     expect(await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//img[contains(@src,'https://geoportal-hamburg.de/legende/legende_solar.png')]"))).to.exist;
    //     await (await driver.findElement(By.xpath("//div[contains(@class,'legend-window')]//span[contains(@class, 'glyphicon-remove')]"))).click();
    //     expect((await driver.findElements(By.css("div.legend-window"))).length).to.equal(0);

    //     // check layer information in topic tree
    //     await (await driver.findElement(By.css("div#navbarRow li:first-child"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tree"))));
    //     await (await driver.findElement(By.xpath("//ul[@id='tree']/li[.//span[@title='Eignungsflächen']]//span[contains(@class,'glyphicon-info-sign')]"))).click();
    //     await driver.wait(until.elementIsVisible(await driver.findElement(By.id("layerInformation"))));

    //     expect(await driver.findElements(By.xpath("//*[contains(text(),'Fehler beim Laden der Vorschau der Metadaten.')]"))).to.be.empty;
    // });

    // it("?featureid= displays markers for features", async function () {
    //     await loadUrl(driver, `${url}?featureid=18,26`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
    //         {coordinate: [568814.3835, 5931819.377], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"},
    //         {coordinate: [567043.565, 5934455.808], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"}
    //     ]), 20000);
    // });

    // it("?zoomToFeatureId= displays markers for features", async function () {
    //     await loadUrl(driver, `${url}?zoomToFeatureId=18,26`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
    //         {coordinate: [568814.3835, 5931819.377], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"},
    //         {coordinate: [567043.565, 5934455.808], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"}
    //     ]), 20000);
    // });

    // it("?Map/zoomToFeatureId= displays markers for features", async function () {
    //     await loadUrl(driver, `${url}?Map/zoomToFeatureId=18,26`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
    //         {coordinate: [568814.3835, 5931819.377], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"},
    //         {coordinate: [567043.565, 5934455.808], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"}
    //     ]), 20000);
    // });

    // it("?featureViaURL test point", async function () {
    //     await loadUrl(driver, `${url}?featureViaURL=[{"layerId":"42","features":[{"coordinates":[566331.53,5928359.43],"label":"TestPunkt"}]}]`, mode);

    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     await driver.wait(async () => driver.executeScript(doesLayerWithFeaturesExist, [
    //         {coordinate: [566331.53, 5928359.43], image: "https://geodienste.hamburg.de/lgv-config/img/location_eventlotse.svg"}
    //     ]), 20000);
    // });

    // it("?featureViaURL test point", async function () {
    //     await loadUrl(driver, `${url}?featureViaURL=[{"layerId":"4200","features":[{"coordinates":[[10.15,53.5],[10.05,53.5],[10.05,53.55]],"label":"TestLinie"}]}]`, mode);
    //     await driver.wait(until.elementLocated(By.css(".navbar")), 12000);
    //     await driver.executeScript(isLayerVisible, "4200");
    // });

    // it("?config= allows selecting a config", async function () {
    //     const splitUrl = url.split("_");
    //     let urlAffix = "";

    //     if (splitUrl.length > 1) {
    //         splitUrl.shift();
    //         urlAffix = `_${splitUrl.join("_")}`;
    //     }

    //     // test by redirecting master to default
    //     await loadUrl(driver, `${url}?config=../masterDefault${urlAffix}/config.json`, mode);

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .form-inline .catalog-selection .form-control"))).to.exist;

    //     // test by redirecting master to default with layers
    //     // await loadUrl(driver, `${url}?layerIDs=19969,4915&visibility=true,true&transparency=0,0&config=../masterDefault${urlAffix}/config.json`, mode);
    //     // await closeSingleAlert(driver);

    //     // // no alert present
    //     // expect(await driver.findElements(By.css(".singleAlertMessage"))).to.be.empty;

    //     // test by redirecting master to custom
    //     await loadUrl(driver, `${url}?config=../masterCustom${urlAffix}/config.json`, mode);

    //     if (await (await driver.findElements(By.xpath("//div[@class='singleAlertMessage']//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"))).length > 0) {
    //         await closeSingleAlert(driver);
    //     }

    //     expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .control-label"))).to.exist;
    // });

    // it("?configJson= allows selecting a config", async function () {
    //     const splitUrl = url.split("_");
    //     let urlAffix = "";

    //     if (splitUrl.length > 1) {
    //         splitUrl.shift();
    //         urlAffix = `_${splitUrl.join("_")}`;
    //     }

    //     // test by redirecting master to default
    //     await loadUrl(driver, `${url}?configJson=../masterDefault${urlAffix}/config.json`, mode);

    //     expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .form-inline .catalog-selection .form-control"))).to.exist;

    //     // test by redirecting master to custom
    //     await loadUrl(driver, `${url}?configJson=../masterCustom${urlAffix}/config.json`, mode);

    //     expect(await driver.findElement(By.css("ul#tree .layer-catalog .header .control-label"))).to.exist;
    // });

});
