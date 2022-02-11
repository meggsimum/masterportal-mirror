const {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils");

/**
 * Tests regarding Search bar.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function SearchBar ({builder, url, resolution, capability}) {
    describe("SearchBar", function () {
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

        it("Search should be executed when 'enter' is pressed", async function () {
            // do something
        });
        it("Search should be executed again when 'backspace' is pressed", async function () {
            // do something
        });
        it("Search should be executed when a search string with 'paste' is inserted into the search bar", async function () {
            // do something
        });
        it("Search results should be navigable with the arrow keys", async function () {
            // do something
        });
        it("Clicking on the 'magnifying glass icon' should execute the selection of the first search result.", async function () {
            // do something
        });
        it("When clicking on the 'close-icon' the search string should be removed and no more search results should be displayed.", async function () {
            // do something
        });
    });
}

module.exports = SearchBar;
