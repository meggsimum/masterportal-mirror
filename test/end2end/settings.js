const capabilities = {
        firefox: {"browserName": "firefox", acceptSslCerts: true, acceptInsecureCerts: true},
        chrome: {"browserName": "chrome", version: "latest", acceptSslCerts: true, acceptInsecureCerts: true},
        edge: {"browserName": "MicrosoftEdge", version: "latest", acceptSslCerts: true, acceptInsecureCerts: true}
    },
    /** TODO
     * when changing the following values, also change the functions beneath; the values there should eventually
     * be replaced with references to these arrays, but during test writing, cases are oftentimes commented out,
     * effectively changing indices lots of time; do this when all e2e tests have been written
     */
    resolutions = [
        "1920x1080"
        // "600x800"
    ],
    resolutionsMacOS = [
        "1920x1440"
    ],
    configs = new Map([
        ["basic", "basic"],
        ["master", "master"],
        ["custom", "masterCustom"],
        ["default", "masterDefault"]
    ]),
    modes = [
        "2D"
        // "3D",
        // "OB"
    ];

/**
 * Returns true for all resolutions marked mobile.
 * @param {String} resolution as WIDTHxHEIGHT
 * @returns {boolean} whether resolution is supposed to model mobile view
 */
function isMobile (resolution) {
    return resolution === "600x800";
}

/**
 * Returns true for 2D mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is 2D
 */
function is2D (mode) {
    return mode === "2D";
}

/**
 * Returns true for 3D mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is 3D
 */
function is3D (mode) {
    return mode === "3D";
}

/**
 * Returns true for OB mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is OB
 */
function isOB (mode) {
    return mode === "OB";
}

/**
 * Returns true for url indicating basic configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is basic
 */
function isBasic (url) {
    return url.split("?")[0].indexOf(configs.get("basic") + "_") > -1 || url.split("?")[0].endsWith(configs.get("basic"));
}

/**
 * Returns true for url indicating master configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is basic
 */
function isMaster (url) {
    // e.g. "https://test.geoportal-hamburg.de/master_BG-1320
    return url.split("?")[0].indexOf(configs.get("master") + "_") > -1 || url.split("?")[0].endsWith(configs.get("master"));
}

/**
 * Returns true for url indicating default configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is default
 */
function isDefault (url) {
    return url.split("?")[0].indexOf(configs.get("default") + "_") > -1 || url.split("?")[0].endsWith(configs.get("default"));
}

/**
 * Returns true for url indicating custom configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is custom
 */
function isCustom (url) {
    return url.split("?")[0].indexOf(configs.get("custom") + "_") > -1 || url.split("?")[0].endsWith(configs.get("custom"));
}

/**
 * Returns true for browsername indicating chrome is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is chrome
 */
function isChrome (browsername) {
    return browsername.toLowerCase().includes("chrome");
}

/**
 * Returns true for browsername indicating edge is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is edge
 */
function isEdge (browsername) {
    return browsername.toLowerCase().includes("edge");
}

/**
 * Returns true for browsername indicating firefox is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is firefox
 */
function isFirefox (browsername) {
    return browsername.toLowerCase().includes("firefox");
}

/**
 * Returns true for browsername indicating safari is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is safari
 */
function isSafari (browsername) {
    return browsername.toLowerCase().includes("safari");
}

/**
 * Produces saucelabs configurations.
 * @returns {Object[]} array of bs configuration objects
 */
function getCapabilities () {
    const baseSaucelabs = {
        "host": "saucelabs",
        "sauce:options": {
            "screenResolution": "1920x1080",
            /* eslint-disable-next-line no-process-env */
            "username": process.env.SAUCE_USERNAME,
            /* eslint-disable-next-line no-process-env */
            "accessKey": process.env.SAUCE_ACCESS_KEY,
            "extendedDebugging": true
        }
    };
    /*
    baseSaucelabsMacOS = {
    "host": "saucelabs",
    "sauce:options": {
    "screenResolution": "1920x1440", */
    /* eslint-disable-next-line no-process-env */
    //  "username": process.env.SAUCE_USERNAME,
    /* eslint-disable-next-line no-process-env */
    /*  "accessKey": process.env.SAUCE_ACCESS_KEY,
    "extendedDebugging": true
    }
    }; */

    return [
        {
            ...baseSaucelabs,
            "browserName": "chrome",
            "browserVersion": "latest",
            "platformName": "Windows 10"
        }
        /* ,
        {
            ...baseSaucelabs,
            "browserName": "firefox",
            "browserVersion": "latest",
            "platformName": "Windows 10"
        },
        {
            ...baseSaucelabs,
            "browserName": "MicrosoftEdge",
            "browserVersion": "latest",
            "platformName": "Windows 10"
        }
        {
            ...baseSaucelabsMacOS,
            "browserName": "safari",
            "browserVersion": "latest",
            "platformName": "macOS 10.15"
        } */
    ];

}

module.exports = {
    capabilities,
    resolutions,
    resolutionsMacOS,
    configs,
    modes,
    is2D,
    is3D,
    isOB,
    isMobile,
    isChrome,
    isEdge,
    isFirefox,
    isSafari,
    isBasic,
    isMaster,
    isDefault,
    isCustom,
    getCapabilities
};
