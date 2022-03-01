//filename lib/DriverFactory.js
const { Builder } = require('selenium-webdriver'),
    webdriverChrome = require("selenium-webdriver/chrome");

class DriverFactory {
  constructor(config) {
    this.config = config
  }

  _configure() {
    let builder = new Builder()
    switch (this.config.host) {
      case 'saucelabs':
        builder.usingServer(this.config.saucelabsUrl)
        builder.withCapabilities(this.config.sauce)
        break
      case 'localhost':
        this.setLocalProxyChrome(builder)
        builder.forBrowser(this.config.browserName || "chrome")
        break
    }
    return builder
  }

  async build(testName) {
    this.testName = testName
    this.driver = await this._configure().build()
    const {id_} = await this.driver.getSession()
    this.sessionId = id_
  }

  async quit(testPassed) {
    if (this.config.host === 'saucelabs') {
      this.driver.executeScript('sauce:job-name=' + this.testName)
      this.driver.executeScript('sauce:job-result=' + testPassed)
      if (!testPassed)
        console.log( "See a video of the run at "+this.config.saucelabsUrl+"/" + this.sessionId )
    }
    await this.driver.quit()
  }

  setLocalProxyChrome (builder) {
    const localHttpProxy = process.env.http_proxy,
    localBypassList = ["localhost", "127.0.0.1", "10.*", "geodienste.hamburg.de", "test-geodienste.hamburg.de"];
    let options = new webdriverChrome.Options();

    options = options.addArguments(`--proxy-server=${localHttpProxy}`);
    options = options.addArguments(`--proxy-bypass-list=${localBypassList.join(",")}`);
    options = options.addArguments("--ignore-certificate-errors");
    options = options.addArguments("--ignore-ssl-errors");

    if (this.config.host !== "saucelabs") {
        options = options.addArguments("--no-sandbox");
    }

    builder.setChromeOptions(options);
  }
}

module.exports = DriverFactory