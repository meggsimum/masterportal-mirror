# masterportalAPI

The masterportalAPI is an API to include and show map-content on your webpage. It's based on OpenLayers and extended with functions to easily use configuration and infrastructure files from the masterportal, a feature-rich mapping app developed by geowerkstatt hamburg. Check masterportal.org for further information.

## Usage

Install the masterportalAPI in your project with ``npm install git+https://bitbucket.org/lgv-g12/masterportalapi.git``. The project does not have a default export, but various named exports. Generate and check the documentation as described below for details.

By importing the project by module name like ``import ... from "masterportalAPI"``, most bundlers and bundler configurations will include the whole masterportalAPI. If you only need a subset of the provided functions and want to keep your build clean, directly import the needed functions like ``import {createMap, addLayer} from "masterportalAPI/src/map.js``.

## Scripts

|Script|Effect|
|-|-|
|``npm run example``|Starts a dev server with a running example. Please mind that the page seen is _not_ part of the masterportalAPI, but merely an environment for manual testing. Change code within ``./example/index.js`` to try things. Free hot reloading thanks to parcel.|
|``npm run generate-jsdoc``|Generates the project documentation within the folder ``./docs``.|
|``npm test``|Runs all tests. Prints code coverage to console.|
|``npm test:watch``|Runs all tests in watch mode. Good practive to let this run during development in a separate terminal. |

## About Babel

The Babel dev dependencies are purely added for development tests and jest tests. Babel is required for testing since Node does not support ES6 in .js files so far.
