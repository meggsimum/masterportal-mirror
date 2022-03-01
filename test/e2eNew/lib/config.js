// filename: lib/config.js
module.exports = {
    baseUrl: process.env.BASE_URL || 'https://test.geoportal-hamburg.de/master_dev/',
    host: process.env.HOST || 'saucelabs',
    browserName: process.env.BROWSER || 'chrome',
    saucelabsUrl :"https://ondemand.eu-central-1.saucelabs.com/wd/hub",
    sauce: {
      "browserName": process.env.BROWSER || 'chrome',
      "browserVersion": process.env.BROWSER_VERSION || 'latest',
      "platformName": process.env.PLATFORM_NAME || 'Windows 10',
      "sauce:options": {
        "username": process.env.SAUCE_USERNAME,
        "accessKey": process.env.SAUCE_ACCESS_KEY,
        "screenResolution": "1920x1080",
        "extendedDebugging": true
      }
    },
  }