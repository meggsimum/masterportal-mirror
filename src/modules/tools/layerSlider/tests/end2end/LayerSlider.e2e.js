const webdriver = require("selenium-webdriver"),
    {isMaster, isCustom} = require("../../../../../../test/end2end/settings"),
    {isLayerVisible} = require("../../../../../../test/end2end/library/scripts"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {expect} = require("chai"),
    {By, until} = webdriver;

/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function LayerSliderTests ({builder, url, resolution, capability}) {
    describe("LayerSlider", function () {
        let driver;

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

        if (isMaster(url)) {
            it("Open the tool layerSlider sliderType='player' and check if all elements are visible", async function () {
                let counter = 0;

                do {
                    expect(counter++).to.be.below(10);
                    await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                    await (await driver.findElement(By.css("#tools .bi-film"))).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.id("tool-layer-slider"))).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tool-layer-slider"))));

                const header = await driver.findElement(By.css("div.win-heading div.heading-element p.title"), 5000),
                    h5 = await driver.findElement(By.css("div#tool-layer-slider h5"), 5000),
                    progress = await driver.findElement(By.css("div#tool-layer-slider-player .progress"), 5000),
                    play = await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#play"), 5000),
                    stop = await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#stop"), 5000),
                    backward = await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#backward"), 5000),
                    forward = await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#forward"), 5000),
                    input = await driver.findElement(By.css("div#tool-layer-slider-player div.input-group input#title"), 5000);

                expect(await header.getText()).to.equals("Zeitreihe");
                expect(await h5.getText()).to.equals("Simulation von Beispiel-WMS");
                expect(progress).to.exist;
                expect(play).to.exist;
                expect(stop).to.exist;
                expect(backward).to.exist;
                expect(forward).to.exist;
                expect(input).to.exist;
            });
            it("Click forward and check if the first layer is on", async function () {
                await (await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#forward"), 5000)).click();

                expect(await driver.executeScript(isLayerVisible, "8730")).to.be.true;
                expect(await driver.executeScript(isLayerVisible, "2426")).to.be.false;
                expect(await driver.executeScript(isLayerVisible, "4561")).to.be.false;
            });
            it("Click back and check if the last layer is on", async function () {
                await (await driver.findElement(By.css("div#tool-layer-slider-player div.input-group button#backward"), 5000)).click();

                expect(await driver.executeScript(isLayerVisible, "8730")).to.be.false;
                expect(await driver.executeScript(isLayerVisible, "2426")).to.be.false;
                expect(await driver.executeScript(isLayerVisible, "4561")).to.be.true;
            });
        }
        else if (isCustom(url)) {
            it("Open the tool layerSlider with sliderType='handle' and check if all elements are visible", async function () {
                let counter = 0;

                do {
                    expect(counter++).to.be.below(10);
                    await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                    await (await driver.findElement(By.css("#tools .bi-film"))).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.id("tool-layer-slider"))).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.id("tool-layer-slider"))));

                const header = await driver.findElement(By.css("div.win-heading div.heading-element p.title"), 5000),
                    h5 = await driver.findElement(By.css("div#tool-layer-slider h5"), 5000),
                    slider = await driver.findElement(By.css("div#tool-layer-slider-handle div.slider"), 5000);

                expect(await header.getText()).to.equals("Zeitreihe");
                expect(await h5.getText()).to.equals("Simulation von Beispiel-WMS");
                expect(slider).to.exist;
            });
        }
    });
}

module.exports = LayerSliderTests;
