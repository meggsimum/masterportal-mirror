const {getCenter, setCenter} = require("./scripts.js"),
    {By} = require("selenium-webdriver");

/**
 * Get Text from webdriver elements.
 * @param {Array} elements Elements containing text
 * @returns {Promise} Promise which resolves with an array containing the texts
 */
function getTextOfElements (elements) {
    const textPromises = [];

    for (const element of elements) {
        textPromises.push(element.getText());
    }
    return Promise.all(textPromises);
}

/**
 * @param {object} driver current driver instance
 * @param {Number[]} target expected coordinates
 * @returns {boolean} true if driver eventually center to given target
 */
async function centersTo (driver, target) {
    let center;

    try {
        await driver.wait(async () => {
            center = await driver.executeScript(getCenter);

            return center[0] === target[0] && center[1] === target[1];
        }, 5000, `Map was not centered to ${target}; last coordinate: ${center}.`);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * @param {object} driver current driver instance
 * @param {Number[]} target expected coordinates
 * @returns {boolean} true if driver eventually loses center to given target
 */
async function losesCenter (driver, target) {
    let center;

    try {
        await driver.wait(async () => {
            center = await driver.executeScript(getCenter);

            return center[0] !== target[0] || center[1] !== target[1];
        }, 5000, `Map remained on center ${target}.`);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * Clicks a feature by centering and then clicking the viewport's center.
 * @param {object} driver initialized driver
 * @param {Number[]} coordinates coordinates to jump to and click on
 * @returns {void}
 */
async function clickFeature (driver, coordinates) {
    const viewport = await driver.findElement(By.css(".ol-viewport"));

    await driver.executeScript(setCenter, coordinates);
    // wait until re-centering is sure to be done - may click old center else ...
    await new Promise(r => setTimeout(r, 10));
    await viewport.click();
}

/**
 * Hovering a feature by centering and then hovering the viewport's center.
 * @param {object} driver initialized driver
 * @param {Number[]} coordinates coordinates to jump to and hover over
 * @param {?object} spread if available, is spread within a first move; e.g. use to start hovering from another point {x: -10, y: -10}
 * @returns {void}
 */
async function hoverFeature (driver, coordinates, spread = null) {
    const viewport = await driver.findElement(By.css(".ol-viewport"));

    await driver.executeScript(setCenter, coordinates);

    let actions = driver.actions({bridge: true});

    if (spread) {
        actions = actions.move({origin: viewport, ...spread});
    }

    actions = actions.move({origin: viewport});
    await actions.perform();
}

/**
 * Some elements (e.g. in the search view) are replaced very quickly. It may occur that a command like
 * "(await driver.findElement(x)).click()" crashes as the element has been removed
 * after being found, but before being clicked. To circumvent this issue, this function
 * just retries until the element wasn't removed between find and click.
 * @param {object} driver initialized driver
 * @param {By} selector to find element with
 * @returns {void}
 */
async function reclickUntilNotStale (driver, selector) {
    let error,
        counter = 0;

    do {
        error = null;
        counter++;
        try {
            await (await driver.findElement(selector)).click();
        }
        catch (e) {
            error = e;
            await driver.wait(new Promise(r => setTimeout(r, 100)));
        }
    } while (error !== null && counter < 10);

    if (error) {
        console.error(`reclickUntilNotStale reclicked ${counter} times, but was not successful.`);
        throw error;
    }
}

/**
 * Logs the url to the testing cloud,
 * so far saucelabs are possible.
 * @param {String} sessionId Id of the testing cloud test session.
 * @returns {void}
 */
async function logTestingCloudUrlToTest (sessionId) {
    /* eslint-disable no-process-env */
    const testService = process.env.npm_config_testservice;

    if (testService === "saucelabs") {
        logSauceLabsUrlToTest(sessionId);
    }
}

/**
 * Logs the url to the test currently running in sauce labs.
 * Only the sessionid is needed to generate a URL to the build.
 * @param {String} sessionId Id of the sauce labs test session.
 * @returns {void}
 */
async function logSauceLabsUrlToTest (sessionId) {
    console.warn(`https://app.eu-central-1.saucelabs.com/tests/${sessionId}`);
}

/**
 * Extracts layer order from config.json.
 * Function will sort out special layers not initially visible, e.g. 3D layers and invisible layers.
 * @param {object} configJson config.json file
 * @param {object} services services.json file
 * @returns {string[]} array of names
 */
function getOrderedTitlesFromConfig (configJson, services) {
    /**
     * @param {*} params config.json params for a service entry
     * @returns {string[]} name list
     */
    function converter ({id, name, isVisibleInTree}) {
        // mark invisible layers for removal
        if (isVisibleInTree === false) {
            return false;
        }
        // if id is an array of service ids OR a non-service id, return name, if defined or not
        if (Array.isArray(id) || !(/^\d+$/).test(id)) {
            return name;
        }
        // if name is present in other cases, also use it
        if (name) {
            return name;
        }
        // if name not found, use the service's name
        const service = services.find(entry => entry.id === id);

        if (service) {
            return service.name;
        }
        // if none of the above work, just sort it out
        return false;
    }

    const testTranslations = {
        "translate#common:tree.trafficCameras": ["Verkehrskameras", "survey cameras (traffic)"]
    };

    return [
        ...configJson
            .Themenconfig
            .Fachdaten
            .Layer
            .map(converter)
            .filter(x => x) // filter out false entries
            .map(x => Array.isArray(x) ? x[0] : x), // flatten arrayed names,
        ...configJson.Themenconfig.Hintergrundkarten.Layer.map(converter)
    ]
        // remove initially inactive layers
        .filter(name => !["Gelände", "Gebäude LoD2", "Oblique"].includes(name))
        // execute required translations for test case
        .map(name => testTranslations[name] || name);
}

/**
 * Extracts layer order from config.json.
 * Function will sort out special layers not initially visible, e.g. 3D layers and invisible layers.
 * @param {object} configJson config.json file
 * @returns {string[]} array of ids
 */
function getOrderedIdsFromConfig (configJson) {
    return [
        ...configJson.Themenconfig.Fachdaten.Layer,
        ...configJson.Themenconfig.Hintergrundkarten.Layer
    ]
        .filter(layer => !["12883", "12884", "13032", "5708", "157", "46"].includes(layer.id)) // remove initially inactive and non-tree layers
        .map(layer => {
            // remove tree-invisible layers
            if (layer.isVisibleInTree === false) {
                return false;
            }
            // get ids from children (flat) where appropriate
            return layer.children ? layer.children.map(entry => entry.id) : layer.id;
        })
        .filter(x => x) // filter out previously determined layers
        .map(id => Array.isArray(id) ? id[0] : id) // if id is an array, use first entry as representant
        .map(id => String(parseInt(id, 10))); // e.g. "1933geofox_stations" should only be 1933 for comparison
}

/**
 * Function gets titles in expected-to-be-open layer tree.
 * @param {object} driver driver object
 * @returns {string[]} array of titles
 */
async function getOrderedTitleTexts (driver) {
    const elements = await driver.findElements(By.css("ul#tree span.title"));

    return (await Promise.all(elements.map(async element => {
        const title = await element.getAttribute("title"),
            visible = await element.isDisplayed();

        return visible ? title : false;
    }))).filter(x => x !== false);
}
/**
 * Closes a single alert with className 'singleAlertMessage'.
 * If a message is given it is included in the xpath to search for the el.
 * @param {object} driver driver object
 * @param {string} message shown in the alert or null, if not known
 * @returns {void}
 */
async function closeSingleAlert (driver, message) {
    const part = message ? "[contains(text(),'" + message + "')]" : "",
        selector = By.xpath("//div[@class='singleAlertMessage']" + part + "//parent::div//parent::div//parent::div//parent::div//parent::div//preceding-sibling::span"),
        element = await driver.findElement(selector);

    await element.click();
}

module.exports = {
    getTextOfElements,
    getOrderedTitleTexts,
    getOrderedTitlesFromConfig,
    getOrderedIdsFromConfig,
    centersTo,
    losesCenter,
    clickFeature,
    hoverFeature,
    reclickUntilNotStale,
    logTestingCloudUrlToTest,
    closeSingleAlert
};
