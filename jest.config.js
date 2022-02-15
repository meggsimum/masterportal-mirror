/* eslint-env node */
module.exports = {
    /** ol prints errors without HTMLCanvasElement being available in test environment */
    "setupFiles": ["jest-canvas-mock"],
    /** node_modules are usually ignored by babel-jest, but ol is published in ES6 */
    "transformIgnorePatterns": ["/node_modules/(?!(ol|olcs|ol-mapbox-style|geotiff)/).*/"],
    /** only consider files in src/ for coverage */
    "collectCoverageFrom": ["src/**/*.js"],
    /** coverage reporters */
    "coverageReporters": ["json", "lcov", "text", "clover", "cobertura"],
    /** mapping svg to string representation since jest can't handle svg */
    // "moduleNameMapper": {
    //     "marker.svg": "<rootDir>/public/stringMarker.js"
    // },
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["./jest.setup.js"],
    "verbose": true,
    "moduleFileExtensions": [
        "js",
        "json",
        "vue"
      ],
      "transform": {
        "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
        ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
      }
};