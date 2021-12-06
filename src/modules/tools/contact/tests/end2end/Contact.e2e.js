const webdriver = require("selenium-webdriver"),
    {expect} = require("chai"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {isMaster, isSafari} = require("../../../../../../test/end2end/settings"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {By, until} = webdriver;

/**
 * Tests regarding measure tool.
 * TODO to be tested from mobile mode
 * TODO to be tested from OB mode
 * TODO to be tested from 3D mode
 * @param {e2eTestParams} params parameter set
 * @returns {void}
 */
async function ContactTests ({builder, url, browsername, resolution, capability}) {
    // for a start, testing from 2D desktop mode
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("Contact", function () {
            const windowWidth = 500,
                windowHeight = 420;
            let driver, navBarIcon, toolWindow,
                nameInput, mailInput, telInput, textInput, submitButton;

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


            it("clicking menu entry opens contact form", async function () {
                navBarIcon = await driver.findElement(By.css("div#navbarRow li.dropdown span.bootstrap-icon > .bi-envelope-fill"));
                await navBarIcon.click();

                toolWindow = await driver.wait(until.elementLocated(By.css(".tool-window-vue")), 5000);
                await driver.wait(until.elementIsVisible(toolWindow), 5000);
            });

            it("contact form holds fields name, mail, telephone, and text, and has submit button", async function () {
                nameInput = (await driver.findElements(By.css("#tool-contact-username-input")))[0];
                mailInput = (await driver.findElements(By.css("#tool-contact-mail-input")))[0];
                telInput = (await driver.findElements(By.css("#tool-contact-phone-input")))[0];
                textInput = (await driver.findElements(By.css("#tool-contact-message-input")))[0];
                submitButton = (await driver.findElements(By.css("#tool-contact-send-message")))[0];

                expect(nameInput).to.exist;
                expect(mailInput).to.exist;
                expect(telInput).to.exist;
                expect(textInput).to.exist;
                expect(submitButton).to.exist;
            });

            it("values can be entered in the fields", async function () {
                // wait a second for animation to finish - needed in Chrome
                await driver.wait(new Promise(r => setTimeout(r, 1000)));

                await nameInput.clear();
                await nameInput.sendKeys("Bob Ross");
                expect(await nameInput.getAttribute("value")).to.equal("Bob Ross");

                await mailInput.clear();
                await mailInput.sendKeys("bob_ross@example.com");
                expect(await mailInput.getAttribute("value")).to.equal("bob_ross@example.com");

                await telInput.clear();
                await telInput.sendKeys("55555555");
                expect(await telInput.getAttribute("value")).to.equal("55555555");

                await textInput.clear();
                await textInput.sendKeys("Test crashed? A happy little mistake.");
                expect(await textInput.getAttribute("value")).to.equal("Test crashed? A happy little mistake.");
            });

            (isSafari(browsername) ? it.skip : it)("making the view smaller keeps form in window", async function () {
                await driver.manage().window().setRect({width: windowWidth, height: windowHeight});


                const {height, width, x, y} = await toolWindow.getRect();

                // left and right border of tool within window
                expect(x).to.be.greaterThan(0).and.to.be.lessThan(windowWidth);
                expect(x + width).to.be.greaterThan(0).and.to.be.lessThan(windowWidth);
                // top and bottom border of tool within window
                expect(y).to.be.greaterThan(0).and.to.be.lessThan(windowHeight);
                expect(y + height).to.be.greaterThan(0).and.to.be.lessThan(windowHeight);
            });

            it("making the view larger keeps form in window", async function () {
                await driver.manage().window().setRect({width: 1920, height: 1080});
            });
        });
    }
}

module.exports = ContactTests;
