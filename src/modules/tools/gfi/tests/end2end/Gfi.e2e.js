const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver, loadUrl} = require("../../../../../../test/end2end/library/driver"),
    {clickFeature, logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {By, until} = webdriver;

/**
 * Tests regarding gfi feature.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function GfiTests ({builder, url, resolution, capability, mode}) {
    describe("Gfi", function () {
        /*
        NOTE: Many of the tests currently do not work consistently right now. They are commented out
        in case there's a later repair attempt.
        */
        const exampleHospital = {
            coord: [551370.202, 5937222.981],
            name: "Asklepios Westklinikum Hamburg",
            street: "Suurheid 20"
        };
        let driver;

        before(async function () {
            if (capability) {
                capability.name = this.currentTest.fullTitle();
                capability["sauce:options"].name = this.currentTest.fullTitle();
                builder.withCapabilities(capability);
            }
            driver = await getDriver();
            await loadUrl(driver, url, mode);
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
            it.skip("default tree gfi windows can be dragged, but not outside the screen", async function () {
                do {
                    await clickFeature(driver, exampleHospital.coord);
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.css("div.gfi"))).length === 0);
                await driver.wait(until.elementIsVisible(await driver.findElement(By.css("div.gfi"))));

                await driver.wait(until.elementLocated(By.css("div.basic-drag-handle")), 5000);

                const header = await driver.findElement(By.css("div.basic-drag-handle"));

                // move to center of viewport
                await driver.actions({bridge: true})
                    .dragAndDrop(header, await driver.findElement(By.css(".ol-viewport")))
                    .perform();
                expect(await driver.findElement(By.css("div.gfi")).isDisplayed()).to.be.true;

                // make element reach lower bounds
                await driver.actions({bridge: true})
                    .dragAndDrop(header, {x: -50, y: 350})
                    .perform();
                const {x, y} = await header.getRect(); // eslint-disable-line one-var

                // try to move out of viewport; expect gfi to stay within
                await driver.actions({bridge: true})
                    .dragAndDrop(header, {x: 50, y: 50})
                    .perform();
                expect(await driver.findElement(By.css("div.gfi")).isDisplayed()).to.be.true;

                // check if element moved further down
                expect((await header.getRect()).y).to.equal(y);
                // check if element moved further left
                expect((await header.getRect()).x).not.to.equal(x);
            });
        }

    });
}

module.exports = GfiTests;
