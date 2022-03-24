import DefaultTreeParser from "@modules/core/configLoader/parserDefaultTree.js";
import testServices from "../../../resources/testServices.json";
import Util from "@modules/core/util.js";

// import Collection from "@modules/core/rawLayerList.js";
// import {initializeLayerList} from "@masterportal/masterportalapi/src/rawLayerList";
import {expect} from "chai";

describe("core/configLoader/parserDefaultTree", function () {

    new Util();

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
    /**
     * Helper function to getb the default model.
     * @param {Object} options Options.
     * @returns {Backbone.Model} - Model.
     */
    function getDefaultModel (options) {
        const model = new DefaultTreeParser(options);

        model.setItemList([]);
        model.parseTree(testServices);

        return model;
    }

    describe("the number of folders within the test data", function () {
        it("should be one", function () {
            expect(getDefaultModel({isFolderSelectable: false}).get("itemList").filter(item => Object.keys({"name": "testFolder"}).every(key => item[key] === {"name": "testFolder"}[key])).length).to.be.equal(1);
        });
    });

    describe("removeWmsBySensorThings", function () {
        it("should be an empty array by empty array input", function () {
            expect(getDefaultModel().removeWmsBySensorThings([])).to.be.an("array").that.is.empty;
        });

        it("should be empty array without duplicate wms", function () {
            const layerList = [
                {
                    "id": "100",
                    "typ": "SensorThings",
                    "related_wms_layers": ["300"]
                },
                {
                    "id": "200",
                    "typ": "WMS"
                },
                {
                    "id": "300",
                    "typ": "WMS"
                }
            ];

            expect(getDefaultModel().removeWmsBySensorThings(layerList)).to.be.an("array");
            expect(getDefaultModel().removeWmsBySensorThings(layerList).length).to.equal(2);
            expect(getDefaultModel().removeWmsBySensorThings(layerList)).to.deep.include(
                {
                    "id": "100",
                    "typ": "SensorThings",
                    "related_wms_layers": ["300"]
                },
                {
                    "id": "200",
                    "typ": "WMS"
                }
            );
        });
    });

    describe("getWmsLayerIdsToRemove", function () {
        it("should be an empty array by empty array input", function () {
            expect(getDefaultModel().getWmsLayerIdsToRemove([])).to.be.an("array").that.is.empty;
        });

        it("should be an array with the related_wms_layers", function () {
            const layerList = [
                {
                    "id": "100",
                    "typ": "SensorThings",
                    "related_wms_layers": ["300", "500"]
                },
                {
                    "id": "200",
                    "typ": "SensorThings",
                    "related_wms_layers": ["800"]
                },
                {
                    "id": "200",
                    "typ": "WMS"
                }
            ];

            expect(getDefaultModel().getWmsLayerIdsToRemove(layerList)).to.be.an("array");
            expect(getDefaultModel().getWmsLayerIdsToRemove(layerList)).length(3);
            expect(getDefaultModel().getWmsLayerIdsToRemove(layerList)).includes("300", "500", "800");
        });

    });
});
