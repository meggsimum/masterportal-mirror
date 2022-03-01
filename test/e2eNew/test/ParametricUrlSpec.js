// filename: test/BasePageSpec.js
require("./spec_helper");
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
        expect(await basePage.find(BUTTON_3D).getText()).to.equals("3D");
    });
    it("?Map/mapMode=3D shall start in 3D-mode @basic", async function () {
        await basePage.load("?Map/mapMode=3D");
        await basePage.isDisplayed(COMPASS_NORTH_POINTER, 5000);
        expect(await basePage.find(COMPASS_NORTH_POINTER)).to.exist;
    });
});
