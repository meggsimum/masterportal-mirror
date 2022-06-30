const {until, By} = require("selenium-webdriver"),
    {isInitalLoadingFinished} = require("./scripts");
let lastDriver;

/**
 * Activates 3D mode for opened Masterportal.
 * This is prepared here to rerun universally applicable tests
 * in multiple modes. Turning the 3D mode on/off and other
 * mode-specific tests are done from 2D mode in separate files.
 * @param {selenium.webdriver.Driver} driver to manipulate
 * @returns {void}
 */
async function prepare3D (driver) {
    await driver.wait(until.elementLocated(By.css("#button3D")));
    await (await driver.findElement(By.css("#button3D"))).click();
    await driver.wait(until.elementLocated(By.css("#orientation3d")));
}

/**
 * Activates OB mode for opened Masterportal.
 * This is prepared here to rerun universally applicable tests
 * in multiple modes. Turning the OB mode on/off and other
 * mode-specific tests are done from 2D mode in separate files.
 * @param {selenium.webdriver.Driver} driver to manipulate
 * @returns {void}
 */
async function prepareOB (driver) {
    await driver.wait(until.elementLocated(By.css("#buttonOblique")));
    await (await driver.findElement(By.css("#buttonOblique"))).click();
    // downloads >42MB before setting compass, give it some time
    await driver.wait(until.elementLocated(By.css("#orientation3d .control-box-container.oblique #zoom-in")), 120000);
}

/**
 * Loads url and waits until loading overlays are hidden and backbone is initialized.
 * Will also prepare mode.
 * @param {selenium-webdriver.driver} driver driver object
 * @param {String} url url to load
 * @param {String} mode additional instance preparation before tests can be executed
 * @returns {void}
 */
async function loadUrl (driver, url, mode) {
    doLoadUrl(driver, url);

    await driver.wait(async () => await driver.executeScript(isInitalLoadingFinished) === true, 90000).catch(err => {
        console.warn("isInitalLoadingFinished err:", err);
        console.warn("Try again to load url ", url);
        doLoadUrl(driver, url);
    });

    // prepare 3D resp. OB mode for tests - 2D mode is initial mode, nothing to do
    if (mode === "3D") {
        await prepare3D(driver);
    }
    else if (mode === "OB") {
        await prepareOB(driver);
    }
}

/**
 * Loads the given url and if not localhost executes basic auth.
 * @param {selenium-webdriver.driver} driver driver object
 * @param {String} url url to load
 * @returns {void}
 */
async function doLoadUrl (driver, url) {
    /* eslint-disable no-process-env */
    const testService = process.env.npm_config_testservice;

    await driver.get(url);

    if (url.indexOf("localhost") === -1) {

        if (testService === "saucelabs") {
            const firstPart = url.substring(0, 8),
                secondPart = url.substring(8),
                urlWithBasicAuth = firstPart + "lgv:test@" + secondPart;

            await driver.get(urlWithBasicAuth);
        }

    }
}

/**
 * Builds the driver and sets its resolution.
 * @param {selenium-webdriver.Builder} builder builder for current driver
 * @param {String} resolution formatted as "AxB" with A, B integers
 * @returns {selenium.webdriver.Driver} driver instance
 */
async function getUnnavigatedDriver (builder, resolution) {
    const driver = await builder.build(),
        widthHeight = resolution.split("x").map(x => parseInt(x, 10));

    await driver.manage().window().setRect({width: widthHeight[0], height: widthHeight[1]});
    await driver.manage().setTimeouts(
        {
            implicit: 5000,
            pageLoad: 60000,
            script: 30000
        }
    );

    return driver;
}

/**
 * Prepares the driver for testing; build, set resolution, activate mode, get url.
 * If testing master, the initial alert is closed.
 * @param {selenium-webdriver.Builder} builder builder for current driver
 * @param {String} url to get
 * @param {String} resolution formatted as "AxB" with A, B integers
 * @param {String} mode additional instance preparation before tests can be executed
 * @param {Boolean} [load=true] if true, then load url
 * @returns {selenium.webdriver.Driver} driver instance
 */
async function initDriver (builder, url, resolution, mode, load = true) {
    const driver = await getUnnavigatedDriver(builder, resolution);

    if (load) {
        await loadUrl(driver, url, mode);
    }

    lastDriver = driver;

    return lastDriver;
}

/**
 * Quits the driver
 * @returns {void}
 */
async function quitDriver () {
    if (lastDriver) {
        await lastDriver.quit();
    }
}

/**
 * Gets the driver
 * @returns {selenium.webdriver.Driver} driver instance
 */
async function getDriver () {
    return lastDriver;
}


module.exports = {
    getDriver,
    getUnnavigatedDriver,
    initDriver,
    loadUrl,
    quitDriver
};
