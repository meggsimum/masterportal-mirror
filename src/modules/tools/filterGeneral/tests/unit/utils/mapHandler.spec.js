import {expect} from "chai";
import MapHandler from "../../../utils/mapHandler.js";

describe("src/module/tools/filterGeneral/utils/mapHandler.js", () => {
    let lastError = false,
        onerror = null;

    beforeEach(() => {
        lastError = false;
        onerror = {
            call: error => {
                lastError = error;
            }
        };
    });
    describe("constructor", () => {
        it("should pipe an error if function getLayerByLayerId is missing with the given handlers", () => {
            new MapHandler({}, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if function showFeaturesByIds is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if function createLayerIfNotExists is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if function liveZoom is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should set empty internal structure for knownLayers", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.knownLayers).to.be.an("object").and.to.be.empty;
        });
        it("should set empty internal structure for currentlyFilteredItems", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.currentlyFilteredItems).to.be.an("object").and.to.be.empty;
        });
    });

    describe("getLayerOfExternalSource", () => {
        it("should return recycled layer if filterId matches any knownLayers", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.knownLayers.alreadyUsedFilterId = "foo";
            expect(map.getLayerOfExternalSource("alreadyUsedFilterId")).to.equal("foo");
            expect(lastError).to.not.be.an.instanceof(Error);
        });
        it("should return an unknown layer and should add it to the list of knownLayers", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: layername => layername,
                liveZoom: () => false
            }, onerror.call);

            expect(map.getLayerOfExternalSource("someFilterId")).to.equal("filterGeneral-someFilterId");
            expect(map.knownLayers?.someFilterId).to.equal("filterGeneral-someFilterId");
            expect(lastError).to.not.be.an.instanceof(Error);
        });
    });

    describe("visualizeExternalSource", () => {
        it("should pipe an error if the given layer has no getSource function", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.visualizeExternalSource("items", {}, "page", onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should clear the given layer if page eq 1", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);
            let cleared = false;

            map.visualizeExternalSource([], {
                getSource: () => {
                    return {
                        clear: () => {
                            cleared = true;
                        }
                    };
                }
            }, 1, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(cleared).to.be.true;
        });
        it("should not clear the given layer if page is greater than 1", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);
            let cleared = false;

            map.visualizeExternalSource([], {
                getSource: () => {
                    return {
                        clear: () => {
                            cleared = true;
                        }
                    };
                }
            }, 2, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(cleared).to.be.false;
        });
    });

    describe("getLayerOfTreeSource", () => {
        it("should return recycled layer if filterId matches any knownLayers", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.knownLayers.alreadyUsedFilterId = "foo";
            expect(map.getLayerOfTreeSource("alreadyUsedFilterId")).to.equal("foo");
            expect(lastError).to.not.be.an.instanceof(Error);
        });
        it("should return an unknown layer and should add it to the list of knownLayers", () => {
            const map = new MapHandler({
                getLayerByLayerId: layerId => layerId,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(map.getLayerOfTreeSource("someFilterId", "layerId")).to.equal("layerId");
            expect(map.knownLayers?.someFilterId).to.equal("layerId");
            expect(lastError).to.not.be.an.instanceof(Error);
        });
    });

    describe("visualizeTreeSource", () => {
        it("should clear the given layer if page eq 1", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.currentlyFilteredItems.filterId = ["thisShouldBeCleared"];
            map.visualizeTreeSource("filterId", [], "layer", 1);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.currentlyFilteredItems.filterId).to.be.an("array").and.to.be.empty;
        });
        it("should not clear the given layer if page is greater than 1", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.currentlyFilteredItems.filterId = ["thisShouldNotBeCleared"];
            map.visualizeTreeSource("filterId", [], "layer", 2);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.currentlyFilteredItems.filterId).to.deep.equal(["thisShouldNotBeCleared"]);
        });
    });

    describe("visualize", () => {
        it("should pipe an error if the given filterAnswer is not an object", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            map.visualize("filterAnswer", onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if the given filterAnswer has no service object", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            map.visualize({}, onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if the given filterAnswer has no filterId", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            map.visualize({
                service: {}
            }, onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if the given filterAnswer has no page number", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            map.visualize({
                service: {},
                filterId: "filterId"
            }, onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if the given filterAnswer has no array of items", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            map.visualize({
                service: {},
                filterId: "filterId",
                page: 1,
                items: "items"
            }, onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
        });
    });

    describe("zoomToFilteredFeature", () => {
        it("should return an error if the type of minScale is not number", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.zoomToFilteredFeature("", [], "1", onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should return an error if the filtered feature Ids is empty", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.zoomToFilteredFeature(5000, [], "1", onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should return an error if there are no layer id", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            map.zoomToFilteredFeature(5000, ["1", "2"], undefined, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
    });
});
