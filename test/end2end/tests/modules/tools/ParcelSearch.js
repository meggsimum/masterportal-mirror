const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../library/driver"),
    {getCenter} = require("../../../library/scripts"),
    {isMaster} = require("../../../settings"),
    {logTestingCloudUrlToTest} = require("../../../library/utils"),
    {By, until} = webdriver;

/*
 * TODO for running this test with parcelDenominators (Fluren), the gemarkungen.json in test/end2end/resources
 * has to be programmatically copied over and activated to a testable portal configuration.
 * For now, this test only checks the HH standard scenario.
 */

/**
 * Tests regarding parcel search feature.
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ParcelSearchTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("ParcelSearch", function () {
            const selectors = {
                tools: By.css("ul#root li.dropdown:nth-child(4) a"),
                toolParcelSearch: By.css("ul#tools li.dropdown a span.bootstrap-icon > .bi-search"),
                modal: By.css("div#window"),
                districtLabel: By.css("label[for=\"districtField\"]"),
                districtField: By.css("select#districtField"),
                parcelLabel: By.css("label[for=\"parcelField\"]"),
                parcelField: By.css("input#parcelField"),
                submitButton: By.css("button#submitbutton"),
                minimize: By.css("#window .bi-dash-lg"),
                maximize: By.css("#window p.title")
            };
            let driver, districtField, parcelField, submitButton;

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


            it("opens a modal on activation providing input elements", async () => {
                const toolsLink = await driver.findElement(selectors.tools, 5000),
                    toolParcelSearch = await driver.findElements(selectors.toolParcelSearch, 1000),
                    parcelSearchLink = await toolParcelSearch[1].findElement(By.xpath("./.."), 1000);

                toolsLink.click();
                await driver.wait(until.elementIsVisible(parcelSearchLink), 1000);
                parcelSearchLink.click();

                await driver.wait(new Promise(r => setTimeout(r, 500)));
                await driver.wait(until.elementIsVisible(await driver.findElement(selectors.modal), 2000), 10500);
                await driver.wait(until.elementLocated(selectors.districtLabel), 5000, "districtLabel did not appear.");
                await driver.wait(until.elementLocated(selectors.districtField), 5000, "districtField did not appear.");
                // when the test is expanded, this element should also be checked for availability
                // if (withCadastral) {
                //     // cadastralDistrictLabel: By.css("label[for=\"cadastralDistrictField\"]"),
                //     await driver.wait(until.elementLocated(selectors.cadastralDistrictField));
                //     // cadastralDistrictField: By.css("select#cadastralDistrictField"),
                //     await driver.wait(until.elementLocated(selectors.cadastralDistrictLabel));
                // }
                await driver.wait(until.elementLocated(selectors.parcelLabel), 5000, "parcelLabel did not appear.");
                await driver.wait(until.elementLocated(selectors.parcelField), 5000, "parcelField did not appear.");

                districtField = await driver.findElement(selectors.districtField);
                parcelField = await driver.findElement(selectors.parcelField);
                submitButton = await driver.findElement(selectors.submitButton);
            });

            it("search results in centering and setting of a map marker", async () => {
                await driver.wait(until.elementIsVisible(districtField), 5000, "districtField did not appear");
                await districtField.click();
                await (await driver.findElement(By.xpath("//option[@value='0601']"))).click(); // Allermöhe

                await parcelField.sendKeys("6660");
                await submitButton.click();

                expect(await driver.executeScript(getCenter)).to.deep.equal([576184.954, 5927013.002]);
            });

            it("can be minimized", async () => {
                await driver.wait(until.elementLocated(selectors.minimize), 5000, "minimize button did not appear");

                const minimize = await driver.findElement(selectors.minimize);

                // minimize may not work on first click (timing issue)
                while (await driver.findElement(By.css("#window .win-body")).isDisplayed()) {
                    await minimize.click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                }

                await driver.wait(async () => (await driver.findElements(By.css("#window .win-heading.header-min"))).length === 1);
                expect(await districtField.isDisplayed()).to.be.false;
                expect(await parcelField.isDisplayed()).to.be.false;
                expect(await submitButton.isDisplayed()).to.be.false;
            });

            it("can be maximized again", async () => {
                await driver.wait(until.elementLocated(selectors.maximize), 5000, "maximize button did not appear");

                const maximize = await driver.findElement(selectors.maximize);

                await maximize.click();

                await driver.wait(until.elementIsVisible(
                    await driver.findElement(By.css("#window .win-body")),
                    5000,
                    "window body did not reappear on maximizing"
                ));
                await driver.wait(
                    async () => (await driver.findElements(By.css("#window .win-heading.header-min"))).length === 0,
                    5000,
                    "minimized window did not disappear"
                );
                expect(await districtField.isDisplayed()).to.be.true;
                expect(await parcelField.isDisplayed()).to.be.true;
                expect(await submitButton.isDisplayed()).to.be.true;
            });
        });
    }
}

module.exports = ParcelSearchTests;
