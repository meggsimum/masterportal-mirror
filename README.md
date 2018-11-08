# masterportalAPI

## Usage

Install the masterportalAPI in your project with ``npm install git+https://bitbucket.org/lgv-g12/masterportalapi.git``. The project does not have a default export, but various named exports. Generate and check the documentation as described below for details.

## Global modules for development environment

``npm i -g eslint jsdoc``

## Scripts

|Script|Effect|
|-|-|
|``npm run example``|Starts a dev server with a running example. Please mind that the page seen is _not_ part of the masterportalAPI, but merely an environment for manual testing. Change code within ``~/example/index.js`` to try things. Free hot reloading thanks to parcel.|
|``npm run generate-jsdoc``|Generates the project documentation within the folder ``./docs``.|
|``npm test``|Runs all tests. Prints code coverage to console.|
|``npm test:watch``|Runs all tests in watch mode. Good practive to let this run during development in a separate terminal. |

## About Babel

The Babel dev dependencies are purely added for development tests and jest tests. Babel is required for testing since Node does not support ES6 in .js files so far.
