const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver} = require("../../../library/driver"),
    {zoomIn} = require("../../../library/scripts"),
    {clickFeature, hoverFeature} = require("../../../library/utils"),
    {isDefault, isCustom, isBasic} = require("../../../settings"),
    {By, until} = webdriver;

/**
 * Tests regarding gfi feature.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function GfiTests ({builder, url, resolution}) {
    describe("Gfi", function () {
        let driver;

        beforeEach(async function () {
            driver = await initDriver(builder, url, resolution);
        });

        afterEach(async function () {
            await driver.quit();
        });

        if (isCustom(url)) {
            /* NOTE
             * This test fails (in Chrome only?) due to a CSS issue where the nav-bar will be multiline
             * in test resolution 1024x768. This causes the page to be scrollable, which in turn
             * confuses Chrome regarding clicking the center of ".ol-viewport" - instead, Chrome
             * will click somewhere near the feature.
             */
            it("custom tree hospitals open gfi on click", async function () {
                await clickFeature(driver, [576048.895, 5957194.601]);
                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//td[contains(.,'Heinrich Sengelmann Krankenhaus')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[contains(.,'Kayhuder Straße 65')]"))).to.exist;
            });
        }

        if (isCustom(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            it("custom tree hospitals show tooltip on hover", async function () {
                await hoverFeature(driver, [576048.895, 5957194.601]);
                await driver.wait(until.elementLocated(By.css("div.tooltip")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.tooltip"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'tooltip')]//span[contains(.,'Heinrich Sengelmann Krankenhaus')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'tooltip')]//span[contains(.,'Kayhuder Straße 65')]"))).to.exist;
            });
        }

        if (isDefault(url)) {
            it("default tree development plans open gfi on click", async function () {
                // open layer
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.css(".Overlayer > .glyphicon"))).click();
                await (await driver.findElement(By.css("#InfrastrukturBauenundWohnen422 > .glyphicon"))).click();
                await (await driver.findElement(By.css("#BebauungsplneHamburg414 > .glyphicon-unchecked"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [554521.38, 5932738.29]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(.,'Festgestellte Bebauungspläne (PLIS)')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Finkenwerder37')]"))).to.exist;
            });
        }

        if (isBasic(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            it("basic tree hospital+kita layer displays gfi on kita click", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.xpath("//ul[@id='tree']/li[4]/span/span/span"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [577664.4797278475, 5940742.819722826]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[contains(.,'Kindertagesstätten')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'KiTa Koboldwiesen')]"))).to.exist;
            });
        }

        if (isDefault(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            it("default tree traffic camera layer displays gfi including video element", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.css(".Overlayer > .glyphicon"))).click();
                await (await driver.findElement(By.css("#TransportundVerkehr363 > .glyphicon"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Verkehrskameras Hamburg')]"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [565827.0277867382, 5933651.108328401]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.css("div.gfi #video3"))).to.exist;
            });
        }

        if (isBasic(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            it("basic tree traffic intensity layer displays gfi including overview table", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Verkehrsstärken')]"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [561974.6965336638, 5930701.887644928]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));

                // looking up a few sample nodes to confirm table is completely rendered
                expect(await driver.findElement(By.css("#tabelle"))).to.exist;
                expect(await driver.findElement(By.css("table.table"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='kategory'][contains(.,'DTV (Kfz/24h)')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='data'][contains(.,'28.000')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='kategory'][contains(.,'DTVw (Kfz/24h)')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='data'][contains(.,'33.000')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='kategory'][contains(.,'SV-Anteil am DTVw (%)')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='kategory'][contains(.,'Baustelleneinfluss')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//td[@class='data'][contains(.,'Ja')]"))).to.exist;

                // open diagram and check details - assuming this historic data from 2010 will not change
                await (await driver.findElement(By.xpath("//a[contains(text(),'Diagramm')]"))).click();
                expect(await driver.findElement(By.css("#DTV"))).to.exist;
                expect(await driver.findElement(By.css("#DTVw"))).to.exist;
                expect(await driver.findElement(By.css("#Schwerverkehrsanteil\\ am\\ DTVw"))).to.exist;

                // check legend of w variant
                await (await driver.findElement(By.css("#DTVw"))).click();
                expect(await driver.findElement(By.xpath("//*[name()='text'][contains(., 'DTVw (Kfz/24h)')]"))).to.exist;

                // check legend of base variant
                await (await driver.findElement(By.css("#DTV"))).click();
                expect(await driver.findElement(By.xpath("//*[name()='text'][contains(., 'DTV (Kfz/24h)')]"))).to.exist;

                // check whether elements are drawn as expected - test assumes this data will not change due to being historic (2010/2011)
                expect(await driver.findElement(By.xpath("//*[name()='rect'][@class='dot_visible'][@attrname='DTV'][@attrval='24000']"))).to.exist;
                expect(await driver.findElement(By.xpath("//*[name()='circle'][@class='dot'][@attrname='DTV'][@attrval='24000']"))).to.exist;
                expect(await driver.findElement(By.xpath("//*[name()='g'][@class='tick']/*[name()='text'][contains(.,'25.000')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//*[name()='g'][@class='tick']/*[name()='text'][contains(.,'2010')]"))).to.exist;
            });
        }

        if (isDefault(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            it("default tree bicycle count layer shows gfi with info page initially open", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.css(".Overlayer > .glyphicon"))).click();
                await (await driver.findElement(By.css("#TransportundVerkehr363 > .glyphicon"))).click();
                await (await driver.findElement(By.css(".layer:nth-child(53) > .layer-item > .glyphicon"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [566800.6939276252, 5934968.732616884]);

                // theme continuousCountingBike is active
                await driver.wait(until.elementLocated(By.css("div.continuousCountingBike")));
                expect(await driver.findElement(By.css("div.continuousCountingBike"))).to.exist;
                // pill "Info" is initially opened
                expect(await driver.findElement(By.css("ul.nav.nav-pills li:first-child.tab-toggle.active"))).to.exist;

                // diagram and table for mode "last day" are shown
                await (await driver.findElement(By.xpath("//a[contains(text(),'letzter Tag')]"))).click();
                expect(await driver.findElement(By.xpath("//div[@id='d3-div']/*[name()='svg'][@class='graph-svg']"))).to.exist;
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tableday"))));

                // diagram and table for mode "last 7 days" are shown
                await (await driver.findElement(By.xpath("//a[contains(text(),'letzte 7 Tage')]"))).click();
                expect(await driver.findElement(By.xpath("//div[@id='d3-div']/*[name()='svg'][@class='graph-svg']"))).to.exist;
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tablelastSevenDays"))));

                // diagram and table for mode "year" are shown
                await (await driver.findElement(By.xpath("//a[contains(text(),'Jahr')]"))).click();
                expect(await driver.findElement(By.xpath("//div[@id='d3-div']/*[name()='svg'][@class='graph-svg']"))).to.exist;
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("#tableyear"))));
            });
        }

        if (isBasic(url)) {
            it("basic tree event layer displays gfi in iFrame", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.xpath("//ul[@id='tree']/li[2]/span/span/span"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [575203.8560565843, 5934816.1562565565]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]"))).to.exist;
                await driver.switchTo().frame(await driver.findElement(By.xpath("//iframe[contains(@class,'gfi-iFrame')]")));
                expect(await driver.findElement(By.xpath("//td[contains(.,'Öjendorfer Park')]"))).to.exist;
            });
        }

        if (isCustom(url)) {
            it("custom tree hvv stop layer displays gfi from application/vnd.ogc.gml", async function () {
                // hvv stops not available on initial zoom level
                await driver.executeScript(zoomIn);

                // close KiTa/KH layer
                await (await driver.findElement(By.css(".layer-item:nth-child(1) > .layer-item > .glyphicon"))).click();
                // open hvv stop layer
                await (await driver.findElement(By.css(".Overlayer > .glyphicon"))).click();
                await (await driver.findElement(By.css("#EisenbahnwesenPersonenbefrderung75 > .glyphicon"))).click();
                await (await driver.findElement(By.css("#HamburgerVerkehrsverbundHVV76 > .glyphicon-plus-sign"))).click();
                await (await driver.findElement(By.css(".layer:nth-child(15) > .layer-item > .glyphicon"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [576229.78, 5931627.22]);

                await driver.wait(until.elementLocated(By.css("div.gfi")));
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//span[@class='gfi-title'][contains(.,'Haltestellen')]"))).to.exist;
                expect(await driver.findElement(By.xpath("//div[contains(@class, 'gfi')]//td[contains(.,'Mümmelmannsberg')]"))).to.exist;
            });
        }

        if (isDefault(url)) {
            // NOTE same centering issue as previously ("custom tree hospitals open gfi on click")
            // NOTE dragAndDrop does nothing in Chrome; the test just does nothing there and still passes
            it("default tree gfi windows can be dragged, but not outside the screen", async function () {
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();
                await (await driver.findElement(By.css(".Overlayer > .glyphicon"))).click();
                await (await driver.findElement(By.css("#TransportundVerkehr363 > .glyphicon"))).click();
                await (await driver.findElement(By.css(".layer:nth-child(53) > .layer-item > .glyphicon"))).click();
                await (await driver.findElement(By.xpath("//span[contains(.,'Themen')]"))).click();

                await clickFeature(driver, [566800.6939276252, 5934968.732616884]);

                await driver.wait(until.elementLocated(By.css("div.gfi-header.ui-draggable-handle")));

                // move to center of viewport
                await driver.actions({bridge: true})
                    .dragAndDrop(
                        await driver.findElement(By.css("div.gfi-header.ui-draggable-handle")),
                        await driver.findElement(By.css(".ol-viewport"))
                    );
                expect(await driver.findElement(By.css("div.gfi")).isDisplayed()).to.be.true;

                // try to move out of viewport; expect gfi to stay within
                await driver.actions({bridge: true})
                    .dragAndDrop(await driver.findElement(By.css("div.gfi-header.ui-draggable-handle")), {x: 9999, y: 9999});
                expect(await driver.findElement(By.css("div.gfi")).isDisplayed()).to.be.true;
            });
        }
    });
}

module.exports = GfiTests;
