//filename lib/DriverFactory.js
const { Builder } = require('selenium-webdriver'),
    webdriverChrome = require("selenium-webdriver/chrome");

class DriverFactory {
  constructor(config) {
    this.config = config
  }

  _configure() {
    let builder = new Builder()
    console.warn("this.config:",this.config);
    switch (this.config.host) {
      case 'saucelabs':
        // const url = 'https://test.geoportal-hamburg.de/master_dev/'
        // builder.usingServer(url)
        builder.forBrowser(this.config.sauce.browser || "chrome")
        console.warn("called builder.forBrowser with ", this.config.sauce.browser || "chrome")
        builder.withCapabilities(this.config.sauce)
        console.warn("called builder.withCapabilities:", this.config.sauce);
        break
      case 'localhost':
        // process.env.PATH +=
        //   path.delimiter + path.join(__dirname, '..', 'vendor')
        this.setLocalProxyChrome(builder)
        builder.forBrowser(this.config.browser || "chrome")
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
        console.log(
          'See a video of the run at https://saucelabs.com/tests/' +
            this.sessionId
        )
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

    // if (testService === undefined) {
        options = options.addArguments("--no-sandbox");
    // }

    builder.setChromeOptions(options);
  }
}

module.exports = DriverFactory