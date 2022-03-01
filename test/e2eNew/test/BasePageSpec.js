// filename: test/BasePageSpec.js
require("./spec_helper");
const assert = require("assert");
const BasePage = require("../pages/BasePage");

describe("masterportal", function () {
    const MENU = {css: "ul#root li:first-child"},
        TREE = {css: "#root > li.dropdown.dropdown-folder.open"};

    let basePage;

    beforeEach(async function () {
        basePage = new BasePage(this.driver);
        await basePage.load();
    });

    // run with: npm testneu -- --grep @basic
    // to run all tests with the marker @basic
    it("is menu visible and opens tree on click @basic", async function () {
        await basePage.isDisplayed(MENU, 12000);
        await basePage.click(MENU);

        assert(await basePage.isDisplayed(TREE));
    });

});
