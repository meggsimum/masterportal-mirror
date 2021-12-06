>Browser testing with Selenium WebDriver

[TOC]

# Install browser test drivers (WebDrivers)

   To locally run the browser tests, drivers have to be installed on your system. At least *chromedriver* should be installed, but you may also install further drivers for test automation. (Hint: For Firefox, the name of the WebDriver is *geckodriver*.)

   Using the variable "browser" (see below), these browsers can be used for automated tests:

   - "chrome": Chrome-Browser
   - "firefox": Firefox
   - "edge": Microsoft Edge

   For installation, [download the required drivers](https://docs.seleniumhq.org/download/) and make them available to the system environment. On Windows, this is done by adding the driver's paths to the `path` variable in your system environment variables. The `.exe` file must have been placed in a folder where `.exe` files are allowed to be executed.

   To test your setup, open a new `cmd` terminal (no administrative rights required) and run e.g. `chromedriver`. This should print *"ChromeDriver was started successfully."*, or any other confirmation, depending on the driver you're testing.

# Locally run tests

To locally run the tests, a Masterportal dev server has to be started. Run `npm start` to do so. Then, run `npm run browsertest` to execute the tests.

You may also start a run with modified parameters to e.g. use your local proxy, set the browser to test, or change the URL the portal is running on.


```console
$ browser=firefox url=[url] proxy=[proxyurl] ./node_modules/.bin/mocha ./test/end2end/TestRunner.js
```

You may also define the variables for your test environment by creating a file `.env` in the Masterportal root, containing your variables. The file will be read on each test run.

# Run tests on SauceLabs.com

To run the local systems tests on Sauce Labs, you need to open a [sauce trusted connection](https://docs.saucelabs.com/secure-connections):

   -  You need to download [Sauce Connect Proxy](https://docs.saucelabs.com/secure-connections/sauce-connect/installation)
   -  Then define your [setup and configuration](https://docs.saucelabs.com/secure-connections/sauce-connect/setup-configuration/setup-configuration)


```console
$ bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -x $SAUCE_DC -i TUNNEL_ID'
```

   -  When sauce connect is up you can run the browsertest

```console
$ npm run browsertestOnSauceLabs
```

# How to write tests

## Test file location

Test files have to be saved with the file extension `.e2e.js`. All test files have to be placed next to the component and store being tested in a separate `tests/end2end` folder. For illustration, the following example was constructed using the `ScaleSwitcher` component.

```
src
|-- modules
|   |-- tools
|   |   |-- scaleSwitcher
|   |   |   |-- components
|   |   |	|   |-- ScaleSwitcher.vue
|   |   |   |   |-- ...
|   |   |	|-- store
|   |   |   |   |-- actionsScaleSwitcher.js
|   |   |   |   |-- gettersScaleSwitcher.js
|   |   |   |   |-- indexScaleSwitcher.js
|   |   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |   |-- stateScaleSwitcher.js
|   |   |   |
|   |   |	|-- tests
|   |   |	|   |-- end2end
|   |   |   |	|   |-- ScaleSwitcher.e2e.js
|   |   |	|   |-- unit
|   |   |   |	|   |-- components
|   |   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.spec.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.spec.js
|   |   |   |   |	|   |-- mutationsScaleSwitcher.spec.js
```

## File structure

The following sub-chapters contain example test files that may be used as guideline.

## Creating the ScaleSwitcher.e2e.js

```js
const webdriver = require("selenium-webdriver");

/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function ScaleSwitcherTests ({builder, url, resolution, capability}) {

}

module.exports = ScaleSwitcherTests;
```

## Register the "ScaleSwitcher.e2e.js"

Open `masterportal/test/end2end/test.js` and add the path of the `ScaleSwitcher.e2e.js` to the array `suites`. In this file all paths to the files are configured with end2end tests.

```js
const suites = [
    ...

                // modules/tools
                require("../../src/modules/tools/contact/tests/end2end/Contact.e2e.js"),
                // require("./tests/modules/tools/PopulationRequest_HH.js"),
                require("./tests/modules/tools/ExtendedFilter.js"),
                require("./tests/modules/tools/List.js"),
                require("../../src/modules/tools/supplyCoord/tests/end2end/SupplyCoord.e2e.js"),
                require("../../src/modules/tools/measure/tests/end2end/Measure.e2e.js"),
                require("../../src/modules/tools/scaleSwitcher/tests/end2end/ScaleSwitcher.e2e.js"), // add the tool scaleSwitcher
                require("./tests/modules/tools/ParcelSearch.js"),
                require("../../src/modules/tools/searchByCoord/tests/end2end/SearchByCoord.e2e.js"),

...
            ],
```

## Add a describe for testing

The tests should only be tested in the `portal/master`, because the scale switcher is only configured in this portal.
At the beginning, an `only` can be appended to the `describe`. This way, when starting the End2End tests, only the tests within this describe will be tested. This is especially helpful when creating tests.
Note: After completion of the tests the `only` must be removed again, so that **all** tests are running again.

```js
const webdriver = require("selenium-webdriver"),
    {isMaster} = require("../../../../../../test/end2end/settings");


/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function ScaleSwitcherTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    // The test will only run on the `masterportal/portal/master`
    if (testIsApplicable) {
        describe.only("ScaleSwitcher", function () {
        });
    }
}

module.exports = ScaleSwitcherTests;

```

## Add Hooks

There are basically 3 hooks added.

### Before

Executed once in describe.
Sets the title of the test, if the tests are executed via a pipeline on Saucelabs. Get the driver.

```js
 before(async function () {
    if (capability) {
        // Title for the tests on saucelabs
        capability.name = this.currentTest.fullTitle();
        // Title for the tests on saucelabs
        capability["sauce:options"].name = this.currentTest.fullTitle();
        // After a change, this must be communicated to the builder
        builder.withCapabilities(capability);
    }
    // Get the driver
    driver = await getDriver();
});
```

### After

Will be executed once after all tests have been run.
If the tests are piped to Saucelabs, the URL to executed tests is logged to Saucelabs.

```js
after(async function () {
    if (capability) {
        // Logs the url to the test on saucelabs if the tests were started there
        driver.session_.then(function (sessionData) {
            logTestingCloudUrlToTest(sessionData.id_);
        });
    }
});
```

### AfterEach

Will be executed after each test.
It serves as a fallback, if a test fails it will be restarted. This is done because it can happen that a resource from the web does not respond on the first try.

```js
afterEach(async function () {
    // Executed only once after the failure of a test
    if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
        // Quit the driver
        await quitDriver();
        // Initialize the driver again
        driver = await initDriver(builder, url, resolution);
    }
});
```


### All hooks together:

```js
const webdriver = require("selenium-webdriver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils");


/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function ScaleSwitcherTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe.only("ScaleSwitcher", function () {
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
        });
    }
}

module.exports = ScaleSwitcherTests;

```

## Add first tests

When testing a tool, it is generally advisable to open it first. To do this, you should first check whether the tool is already open. Then check whether all the desired elements are present and have the correct content. The tests are performed asynchronously, so an `await` must always be used when querying elements.

```js
const webdriver = require("selenium-webdriver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {expect} = require("chai"),
    {By, until} = webdriver;

...

it("Open the tool scaleSwitcher and check if all elements are visible", async function () {
    let counter = 0;

    do {
        // Try to open the tool a maximum of 10 times in intervals of 100 milliseconds
        expect(counter++).to.be.below(10);
        // Open the scaleSwitcher with two clicks
        await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
        await (await driver.findElement(By.css("#tools .bi-arrows-angle-contract"))).click();
        // Interval of 100 milliseconds.
        await driver.wait(new Promise(r => setTimeout(r, 100)));
    // If the tool was found the condition is fulfilled
    } while ((await driver.findElements(By.id("scale-switcher"))).length === 0);

    // Check if the scaleSwitcher is visible
    await driver.wait(until.elementIsVisible(await driver.findElement(By.id("scale-switcher"))));

    // Get the elements that are in the tool
    const header = await driver.findElement(By.css("div.win-heading div.heading-element p.title"), 5000),
        label = await driver.findElement(By.css("div#scale-switcher label"), 5000),
        select = await driver.findElement(By.id("scale-switcher-select"), 5000),
        selectValue = await select.getAttribute("value");

    // Check if the contents of the elements have the right content
    expect(await header.getText()).to.equals("Maßstab umschalten");
    expect(await label.getText()).to.equals("Maßstab");
    expect(selectValue).to.equals("60000");
});
```

## Other tests

In further tests the reactions of the elements can be tested. For example, whether a desired state has occurred after clicking on an element.

With the ScaleSwitcher it is tested whether after selection of a scale the map has adopted the same scale. To query the map scale, a function is added in the `masterportal/test/end2end/library/scripts` file that queries the scale from the map. This function is reqiuired in the ScaleSwitcher test file.
If one of the other tests fails and is executed again by the `afterEach` hook, it is necessary that the initial conditions are executed there again. In this case the tool should be opened again.

masterportal/src/modules/tools/scaleSwitcher/tests/end2end/ScaleSwitcher.e2e.js
```js
const webdriver = require("selenium-webdriver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {expect} = require("chai"),
    {By, until} = webdriver,
    {getScale} = require("../../../../../../test/end2end/library/scripts");

...
afterEach(async function () {
    if (this.currentTest._currentRetry === this.currentTest._retries - 1) {
        await quitDriver();
        driver = await initDriver(builder, url, resolution);
        // Open the scaleSwitcher tool again
        await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
        await (await driver.findElement(By.css("#tools .bi-arrows-angle-contract"))).click();
    }
});

...

it("Switch scale to 1 : 10000 and check if the scale of the map has switched as well", async function () {
    // Get the dropdown with scales
    const select = await driver.findElement(By.id("scale-switcher-select"), 5000),
        targetScale = 10000;

    // Click for the scale 1 : 10000
    await select.click();
    await (await driver.findElement(By.css(`#scale-switcher-select option[value="${targetScale}"]`))).click();

    // Check if the value of the dropdown and the map have adopted the new scale 10000.
    expect(await select.getAttribute("value")).to.equals(String(targetScale));
    expect(await driver.executeScript(getScale)).to.equals(targetScale);
});

it("Switch scale to 1 : 250000 and check if the scale of the map has switched as well", async function () {
    // Get the dropdown with scales
    const select = await driver.findElement(By.id("scale-switcher-select"), 5000),
        targetScale = 250000;

    // Click for the scale 1 : 25000
    await select.click();
    await (await driver.findElement(By.css(`#scale-switcher-select option[value="${targetScale}"]`))).click();

    // Check if the value of the dropdown and the map have adopted the new scale 25000.
    expect(await select.getAttribute("value")).to.equals(String(targetScale));
    expect(await driver.executeScript(getScale)).to.equals(targetScale);
});
```

masterportal/test/end2end/library/scripts
```js
/**
 * @returns {String} The scale of the map.
 */
function getScale () {
    const options = Backbone.Radio.request("MapView", "getOptions");

    return options ? options.scale : null;
}

...

module.exports = {
    mockGeoLocationAPI,
    mouseWheelUp,
    mouseWheelDown,
    areAllLayersHidden,
    areRegExpsInMeasureLayer,
    areAllFeaturesOfLayerVisible,
    basicAuth,
    getMarkerPointCoord,
    getMeasureLayersTexts,
    isFullscreen,
    isLayerVisible,
    isMarkerPointVisible,
    imageLoaded,
    isInitalLoadingFinished,
    isObModeOn,
    getOrderedLayerIds,
    getObModeResolution,
    getCoordinatesOfXthFeatureInLayer,
    hasVectorLayerLength,
    hasVectorLayerStyle,
    areLayersOrdered,
    doesLayerWithFeaturesExist,
    getCenter,
    getResolution,
    getScale, // the export of the function `getScale`
    getTilt,
    getHeading,
    getDirection,
    setCenter,
    setResolution,
    setTilt,
    zoomIn,
    zoomOut
};
```

## The complete test file: masterportal/src/modules/tools/scaleSwitcher/tests/end2end/ScaleSwitcher.e2e.js

Remove the `only` from the `describe`. After that the file looks like this.

```js
const webdriver = require("selenium-webdriver"),
    {isMaster} = require("../../../../../../test/end2end/settings"),
    {initDriver, getDriver, quitDriver} = require("../../../../../../test/end2end/library/driver"),
    {logTestingCloudUrlToTest} = require("../../../../../../test/end2end/library/utils"),
    {expect} = require("chai"),
    {By, until} = webdriver,
    {getScale} = require("../../../../../../test/end2end/library/scripts");


/**
 * Tests regarding scale switcher tool.
 * @param {e2eTestParams} params The parameter set.
 * @returns {void}
 */
async function ScaleSwitcherTests ({builder, url, resolution, capability}) {
    const testIsApplicable = isMaster(url);

    if (testIsApplicable) {
        describe("ScaleSwitcher", function () {
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
                    await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                    await (await driver.findElement(By.css("#tools .bi-arrows-angle-contract"))).click();
                }
            });

            it("Open the tool scaleSwitcher and check if all elements are visible", async function () {
                let counter = 0;

                do {
                    expect(counter++).to.be.below(10);
                    await (await driver.findElement(By.xpath("//ul[@id='tools']//.."))).click();
                    await (await driver.findElement(By.css("#tools .bi-arrows-angle-contract"))).click();
                    await driver.wait(new Promise(r => setTimeout(r, 100)));
                } while ((await driver.findElements(By.id("scale-switcher"))).length === 0);

                await driver.wait(until.elementIsVisible(await driver.findElement(By.id("scale-switcher"))));

                const header = await driver.findElement(By.css("div.win-heading div.heading-element p.title"), 5000),
                    label = await driver.findElement(By.css("div#scale-switcher label"), 5000),
                    select = await driver.findElement(By.id("scale-switcher-select"), 5000),
                    selectValue = await select.getAttribute("value");

                expect(await header.getText()).to.equals("Maßstab umschalten");
                expect(await label.getText()).to.equals("Maßstab");
                expect(selectValue).to.equals("60000");
            });

            it("Switch scale to 1 : 10000 and check if the scale of the map has switched as well", async function () {
                const select = await driver.findElement(By.id("scale-switcher-select"), 5000),
                    targetScale = 10000;

                await select.click();
                await (await driver.findElement(By.css(`#scale-switcher-select option[value="${targetScale}"]`))).click();

                expect(await select.getAttribute("value")).to.equals(String(targetScale));
                expect(await driver.executeScript(getScale)).to.equals(targetScale);
            });

            it("Switch scale to 1 : 250000 and check if the scale of the map has switched as well", async function () {
                const select = await driver.findElement(By.id("scale-switcher-select"), 5000),
                    targetScale = 250000;

                await select.click();
                await (await driver.findElement(By.css(`#scale-switcher-select option[value="${targetScale}"]`))).click();

                expect(await select.getAttribute("value")).to.equals(String(targetScale));
                expect(await driver.executeScript(getScale)).to.equals(targetScale);
            });
        });
    }
}

module.exports = ScaleSwitcherTests;

```
