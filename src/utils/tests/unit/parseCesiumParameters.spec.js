import {expect} from "chai";
import parseCesiumParameters from "../../parseCesiumParameters.js";

describe("src/utils/parseCesiumParameters.js", () => {

    beforeEach(() => {
        Config.cesiumParameter = null;
    });

    it("parse empty params should not fail", () => {
        const urlParams = {},
            returnValue = {
                globe: {},
                camera: {}
            };

        expect(parseCesiumParameters(urlParams)).to.be.deep.equals(returnValue);
    });
    it("parse undefined or null should not fail", () => {
        const returnValue = {
            globe: {},
            camera: {}
        };

        expect(parseCesiumParameters(undefined)).to.be.deep.equals(returnValue);
        expect(parseCesiumParameters(null)).to.be.deep.equals(returnValue);
    });
    it("parse urlParams shall be returned as camera params", () => {
        const urlParams = {
                altitude: 1.2,
                tilt: 45,
                heading: 1000
            },
            returnValue = {
                globe: {},
                camera: {
                    altitude: 1.2,
                    tilt: 45,
                    heading: 1000
                }
            };

        expect(parseCesiumParameters(urlParams)).to.be.deep.equals(returnValue);
    });
    it("parse Config camera params shall be returned as camera params and test backwards compatibility", () => {
        const returnValue = {
            enableLighting: true,
            maximumScreenSpaceError: 2,
            tileCacheSize: 3,
            globe: {
                enableLighting: true,
                maximumScreenSpaceError: 2,
                tileCacheSize: 3
            },
            camera: {
                altitude: 1.2,
                tilt: 45,
                heading: 1000
            }
        };

        Config.cesiumParameter = {
            enableLighting: true,
            maximumScreenSpaceError: 2,
            tileCacheSize: 3,
            camera: {
                altitude: 1.2,
                tilt: 45,
                heading: 1000
            }
        };

        expect(parseCesiumParameters()).to.be.deep.equals(returnValue);
    });
    it("parse Config params shall be returned as globe params", () => {
        const returnValue = {
            camera: {},
            globe: {
                enableLighting: true,
                maximumScreenSpaceError: 2,
                tileCacheSize: 3
            }
        };

        Config.cesiumParameter = {
            globe: {
                enableLighting: true,
                maximumScreenSpaceError: 2,
                tileCacheSize: 3
            }
        };

        expect(parseCesiumParameters()).to.be.deep.equals(returnValue);
    });
    it("camera url params shall overwrite Config camera params", () => {
        const urlParams = {
                altitude: 1.3,
                tilt: 43,
                heading: 1003
            },
            returnValue = {
                globe: {},
                camera: {
                    altitude: 1.3,
                    tilt: 43,
                    heading: 1003
                }
            };

        Config.cesiumParameter = {
            camera: {
                altitude: 1.2,
                tilt: 45,
                heading: 1000
            }
        };

        expect(parseCesiumParameters(urlParams)).to.be.deep.equals(returnValue);
    });


});
