const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../../../test/end2end/library/driver"),
    {getTextOfElements, logTestingCloudUrlToTest} = require("../../../../../test/end2end/library/utils"),
    {isMaster} = require("../../../../../test/end2end/settings"),
    {By, until} = webdriver;

/**
 * Tests regarding map panning.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function LegendTests ({builder, config, url, resolution, capability}) {
    const testIsApplicable = isMaster(url),
        expectedEntries = {
            master: ["Krankenhäuser", "Schulinfosystem"],
            custom: ["Krankenhäuser und Schulen", "Geobasiskarten (farbig)"]
        }[config];

    if (testIsApplicable) {
        describe("Legend", function () {
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


            it("should contain active layers", async function () {
                // retry until functionality is active - may get stuck else
                do {
                    await (await driver.wait(
                        until.elementLocated(By.css(".legend-menu-item")), 2000)
                    ).click();
                    await driver.wait(new Promise(r => setTimeout(r, 50)));
                } while (
                    // .legend-win only available from the start in master, must check for availability in custom
                    (await driver.findElements(By.id("legend"))).length === 0 ||
                    // additional check for master: since element is available from the start, wait until visible
                    !await (await driver.findElements(By.id("legend")))[0].isDisplayed()
                );

                const legendContent = await driver.wait(until.elementLocated(By.css("div.legend-content")), 2000),
                    headers = await legendContent.findElements(By.css("div.layer-title")),
                    text = await getTextOfElements(headers);

                for (const entry of expectedEntries) {
                    expect(text).to.include(entry);
                }
            });
            it("should respect order of menu entries in portal/master/config.json", async function () {
                const allEntries = await driver.findElements(By.css("#root li a span.menuitem")),
                    // check only the entries with className 'menuitem', visible entries are more
                    expectedEntryNames = ["Themen", "Ansichten", "Werkzeuge", "Legende", "Informationen"];


                for (const [index, entry] of allEntries.entries()) {
                    entry.getText().then(function (text) {
                        const existingIndex = expectedEntryNames.indexOf(text);

                        expect(index).to.be.equals(existingIndex);
                    });
                }
            });
            it("should the menu item of the legend is to be translated", async function () {
                const legendLocator = By.css("li.legend-menu-item a.dropdown-toggle span.menuitem");

                await (await driver.wait(
                    until.elementLocated(By.css("a.current-language")), 9000)
                ).click();

                await driver.wait(until.elementLocated(By.css("div#language-bar div.popup-language")), 9000);

                await (await driver.wait(
                    until.elementLocated(By.xpath("//div[contains(@class,'popup-language')]/div/div/button[contains(.,'English')]")), 9000)
                ).click();

                // wait the language was switched
                await driver.wait(new Promise(r => setTimeout(r, 500)));
                expect(await (await driver.findElement(legendLocator)).getText()).to.equals("Legend");

                await (await driver.wait(
                    until.elementLocated(By.xpath("//div[contains(@class,'popup-language')]/div/div/button[contains(.,'Deutsch')]")), 9000)
                ).click();

                // wait the language was switched
                await driver.wait(new Promise(r => setTimeout(r, 500)));
                expect(await (await driver.findElement(legendLocator)).getText()).to.equals("Legende");

                await (await driver.wait(
                    until.elementLocated(By.css("a.current-language")), 9000)
                ).click();
                await driver.wait(new Promise(r => setTimeout(r, 5000)));
                await (await driver.wait(
                    until.elementLocated(By.css(".legend-menu-item")), 2000)
                ).click();
            });
        });
    }
}

module.exports = LegendTests;
