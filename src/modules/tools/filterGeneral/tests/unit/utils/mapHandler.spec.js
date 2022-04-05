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
        it("should pipe an error if function addLayerByLayerId is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if function getLayers is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should pipe an error if function setParserAttributeByLayerId is missing with the given handlers", () => {
            new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false
            }, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
        });
        it("should set empty internal structure for layers", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.layers).to.be.an("object").and.to.be.empty;
        });
        it("should set empty internal structure for filteredIds", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(map.filteredIds).to.be.an("object").and.to.be.empty;
        });
    });
    describe("initializeLayer", () => {
        it("should try to add the layer by layer id if the current layer does not include the wanted layer", () => {
            let called_addLayerByLayerId = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: layerId => {
                    called_addLayerByLayerId = layerId;
                },
                getLayers: () => {
                    return {};
                },
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.initializeLayer("filterId", "layerId", false, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
            expect(called_addLayerByLayerId).to.equal("layerId");
        });
        it("should set the internal layers and filteredIds for the given filter id and layer id", () => {
            let called_addLayerByLayerId = false;
            const map = new MapHandler({
                getLayerByLayerId: () => "layerModel",
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: layerId => {
                    called_addLayerByLayerId = layerId;
                },
                getLayers: () => {
                    return {
                        getArray: () => [{
                            getVisible: () => true,
                            get: () => "layerId"
                        }]
                    };
                },
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.initializeLayer("filterId", "layerId", false, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(called_addLayerByLayerId).to.be.false;
            expect(map.layers.filterId).to.equal("layerModel");
            expect(map.filteredIds.filterId).to.be.an("array").and.to.be.empty;
        });
        it("should set doNotLoadInitially to true if extern is set", () => {
            let called_layerId = false,
                called_key = false,
                called_value = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => {
                    return {};
                },
                setParserAttributeByLayerId: (layerId, key, value) => {
                    called_layerId = layerId;
                    called_key = key;
                    called_value = value;
                }
            }, onerror.call);

            map.initializeLayer("filterId", "layerId", true, onerror.call);

            expect(lastError).to.be.an.instanceof(Error);
            expect(called_layerId).to.equal("layerId");
            expect(called_key).to.equal("doNotLoadInitially");
            expect(called_value).to.be.true;
        });
    });
    describe("getAmountOfFilteredItemsByFilterId", () => {
        it("should return the number of features", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.filteredIds.filterId = [1, 2, 3];
            expect(map.getAmountOfFilteredItemsByFilterId("filterId")).to.equal(3);
        });
    });
    describe("isLayerActivated", () => {
        it("should return true if the layer is visible", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: command => command === "isSelected"
            };
            expect(map.isLayerActivated("filterId")).to.be.true;
        });
    });
    describe("isLayerVisibleInMap", () => {
        it("should return true if the layer is visible in map", () => {
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: command => command === "isVisibleInMap"
            };
            expect(map.isLayerVisibleInMap("filterId")).to.be.true;
        });
    });
    describe("activateLayer", () => {
        it("should not call onActivated if no layer model was found", () => {
            let called_onActivated = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.activateLayer("filterId", () => {
                called_onActivated = true;
            });
            expect(called_onActivated).to.be.false;
        });
        it("should set featuresloadend event once, set isSelected to true if layer is not activated yet", () => {
            let called_onceEvent = false,
                called_setIsSelected = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: command => {
                    if (command === "isSelected") {
                        return false;
                    }
                    return true;
                },
                set: (command, value) => {
                    if (command === "isSelected") {
                        called_setIsSelected = value;
                    }
                },
                layer: {
                    getSource: () => {
                        return {
                            once: eventname => {
                                called_onceEvent = eventname;
                            }
                        };
                    }
                }
            };

            map.activateLayer("filterId");

            expect(called_onceEvent).to.equal("featuresloadend");
            expect(called_setIsSelected).to.be.true;
        });
        it("should call onActivated with once event if the layer is not activated yet", () => {
            let called_onActivated = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => false,
                set: () => false,
                layer: {
                    getSource: () => {
                        return {
                            once: (eventname, handler) => {
                                handler();
                            }
                        };
                    }
                }
            };

            map.activateLayer("filterId", () => {
                called_onActivated = true;
            });

            expect(called_onActivated).to.be.true;
        });
        it("should call onActivated and set isSelected to true if layer is activated but not visible on the map yet", () => {
            let called_onActivated = false,
                called_setIsSelected = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: command => {
                    if (command === "isSelected") {
                        return true;
                    }
                    else if (command === "isVisibleInMap") {
                        return false;
                    }
                    return true;
                },
                set: (command, value) => {
                    if (command === "isSelected") {
                        called_setIsSelected = value;
                    }
                }
            };

            map.activateLayer("filterId", () => {
                called_onActivated = true;
            });

            expect(called_onActivated).to.be.true;
            expect(called_setIsSelected).to.be.true;
        });
        it("should call onActivated if layer is activated and visible on map, should not set iSelected as they already are", () => {
            let called_onActivated = false,
                called_setIsSelected = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: command => {
                    if (command === "isSelected") {
                        return true;
                    }
                    else if (command === "isVisibleInMap") {
                        return true;
                    }
                    return false;
                },
                set: (command, value) => {
                    if (command === "isSelected") {
                        called_setIsSelected = value;
                    }
                }
            };

            map.activateLayer("filterId", () => {
                called_onActivated = true;
            });

            expect(called_onActivated).to.be.true;
            expect(called_setIsSelected).to.be.false;
        });
    });
    describe("deactivateLayer", () => {
        it("should set isSelected and isVisible to false", () => {
            let called_setIsSelected = true;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => false,
                set: (command, value) => {
                    if (command === "isSelected") {
                        called_setIsSelected = value;
                    }
                }
            };

            map.deactivateLayer("filterId");

            expect(called_setIsSelected).to.be.false;
        });
    });
    describe("clearLayer", () => {
        it("should empty the array with filteredIds and call showFeaturesByIds to empty the map if extern is false", () => {
            let called_ids = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: (layerId, ids) => {
                    called_ids = ids;
                },
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => false
            };
            map.filteredIds.filterId = [1, 2, 3];

            map.clearLayer("filterId", false);

            expect(map.filteredIds.filterId).to.be.an("array").and.to.be.empty;
            expect(called_ids).to.be.an("array").and.to.be.empty;
        });
        it("should empty the array with filteredIds and call the layerSource to clear the map, if extern is true", () => {
            let called_clear = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: what => {
                    if (what === "layerSource") {
                        return {
                            clear: () => {
                                called_clear = true;
                            }
                        };
                    }
                    return {
                        clear: () => false
                    };
                }
            };
            map.filteredIds.filterId = [1, 2, 3];

            map.clearLayer("filterId", true);

            expect(map.filteredIds.filterId).to.be.an("array").and.to.be.empty;
            expect(called_clear).to.be.true;
        });
    });
    describe("addItemsToLayer", () => {
        it("should not try to set features to the map if filterId is unknown for filteredIds", () => {
            let called_showFeaturesByIds = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => {
                    called_showFeaturesByIds = true;
                },
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.addItemsToLayer();

            expect(called_showFeaturesByIds).to.be.false;
        });
        it("should not try to set features to the map if items are not given as an array", () => {
            let called_showFeaturesByIds = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => {
                    called_showFeaturesByIds = true;
                },
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.filteredIds.filterId = [];
            map.addItemsToLayer("filterId");

            expect(called_showFeaturesByIds).to.be.false;
        });
        it("should not try to set features to the map if there is not layer found for filterId", () => {
            let called_showFeaturesByIds = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => {
                    called_showFeaturesByIds = true;
                },
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = false;
            map.filteredIds.filterId = [];
            map.addItemsToLayer("filterId", []);

            expect(called_showFeaturesByIds).to.be.false;
        });
        it("should push items to filteredIds and try to set them on the map if extern is false", () => {
            let called_showFeaturesByIds = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: (layerId, ids) => {
                    called_showFeaturesByIds = ids;
                },
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => false
            };
            map.filteredIds.filterId = [];
            map.addItemsToLayer("filterId", [
                {getId: () => 10},
                {getId: () => 20},
                {getId: () => 30}
            ], false);

            expect(map.filteredIds.filterId).to.deep.equal([10, 20, 30]);
            expect(called_showFeaturesByIds).to.deep.equal([10, 20, 30]);
        });
        it("should add items to layerSource if extern is true", () => {
            let called_items = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => false,
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: what => {
                    if (what === "layerSource") {
                        return {
                            addFeatures: items => {
                                called_items = items;
                            }
                        };
                    }
                    return false;
                }
            };
            map.filteredIds.filterId = [];
            map.addItemsToLayer("filterId", [
                {getId: () => 10},
                {getId: () => 20},
                {getId: () => 30}
            ], true);

            expect(map.filteredIds.filterId).to.deep.equal([10, 20, 30]);
            expect(called_items).to.be.an("array").and.not.to.be.empty;
        });
    });
    describe("zoomToFilteredFeature", () => {
        it("should not pass an error or start liveZoom if isZooming is flagged", () => {
            let called_liveZoom = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => {
                    called_liveZoom = true;
                },
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.isZooming = true;

            map.zoomToFilteredFeature("filterId", "minScale", onerror.call);
            expect(lastError).to.not.be.an.instanceof(Error);
            expect(called_liveZoom).to.be.false;
            expect(map.isZooming).to.be.true;
        });
        it("should pass an error if minScale is not a number", () => {
            let called_liveZoom = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => {
                    called_liveZoom = true;
                },
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.zoomToFilteredFeature("filterId", "minScale", onerror.call);
            expect(lastError).to.be.an.instanceof(Error);
            expect(called_liveZoom).to.be.false;
            expect(map.isZooming).to.be.false;
        });
        it("should try to zoom", () => {
            let called_liveZoom = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: () => {
                    called_liveZoom = true;
                },
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => false
            };
            map.filteredIds.filterId = ["1", "2"];

            map.zoomToFilteredFeature("filterId", 0, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(called_liveZoom).to.be.true;
            expect(map.isZooming).to.be.true;
        });
        it("should try to zoom with the expected parameters", () => {
            let called_minScale = false,
                called_filteredFeatureIds = false,
                called_layerId = false,
                called_callback = false;
            const map = new MapHandler({
                getLayerByLayerId: () => false,
                showFeaturesByIds: () => false,
                createLayerIfNotExists: () => false,
                liveZoom: (minScale, filteredFeatureIds, layerId, callback) => {
                    called_minScale = minScale;
                    called_filteredFeatureIds = filteredFeatureIds;
                    called_layerId = layerId;
                    called_callback = callback;
                },
                addLayerByLayerId: () => false,
                getLayers: () => false,
                setParserAttributeByLayerId: () => false
            }, onerror.call);

            map.layers.filterId = {
                get: () => "layerId"
            };
            map.filteredIds.filterId = [1, 2, 3];

            expect(map.isZooming).to.be.false;

            map.zoomToFilteredFeature("filterId", 10, onerror.call);

            expect(lastError).to.not.be.an.instanceof(Error);
            expect(called_minScale).to.equal(10);
            expect(called_filteredFeatureIds).to.deep.equal([1, 2, 3]);
            expect(called_layerId).to.equal("layerId");
            expect(map.isZooming).to.be.true;

            expect(called_callback).to.be.a("function");
            called_callback();
            expect(map.isZooming).to.be.false;
        });
    });
});
