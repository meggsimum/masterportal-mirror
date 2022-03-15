import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceGazetteer from "../../../searchInterfaces/searchInterfaceGazetteer.js";
import store from "../../../../../app-store";

describe.only("src/modules/searchBar/searchInterfaces/searchInterfaceGazetteer.js", () => {
    let SearchInterface1 = null;

    before(() => {
        store.getters = {
            getRestServiceById: () => sinon.stub()
        };

        SearchInterface1 = new SearchInterfaceGazetteer();

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceGazetteer should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
        });
    });

    describe("normalizeResults", () => {
        it("should normalize an search result", () => {
            const searchResults = [
                {
                    name: "Result Name1",
                    type: "street",
                    geometry: {
                        coordinates: [10, 20]
                    }
                }];

            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            setMarker: {
                                closeResults: true,
                                coordinates: [10, 20]
                            },
                            zoomToFeature: {
                                closeResults: true,
                                coordinates: [10, 20]
                            }
                        },
                        onHover: {
                            setMarker: {
                                closeResults: true,
                                coordinates: [10, 20]
                            }
                        }
                    },
                    category: "modules.searchbar.type.street",
                    id: "ResultName1modules.searchbar.type.street",
                    icon: "glyphicon-road",
                    name: "Result Name1"
                }
            ]);
        });
    });

    describe("getTranslationByType", () => {
        it("returns the translation for type = addressAffixed", () => {
            expect(SearchInterface1.getTranslationByType("addressAffixed")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = addressUnaffixed", () => {
            expect(SearchInterface1.getTranslationByType("addressUnaffixed")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = district", () => {
            expect(SearchInterface1.getTranslationByType("district")).to.equal("modules.searchbar.type.district");
        });
        it("returns the translation for type = houseNumbersForStreet", () => {
            expect(SearchInterface1.getTranslationByType("houseNumbersForStreet")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = parcel", () => {
            expect(SearchInterface1.getTranslationByType("parcel")).to.equal("modules.searchbar.type.parcel");
        });
        it("returns the translation for type = street", () => {
            expect(SearchInterface1.getTranslationByType("street")).to.equal("modules.searchbar.type.street");
        });
    });

    describe("normalizeResultEvents", () => {
        it("should normalize result events", () => {
            const resultEvents = {
                    onClick: ["setMarker", "zoomToFeature"],
                    onHover: ["setMarker"]
                },
                searchResult = {
                    name: "Result Name1",
                    type: "street",
                    geometry: {
                        coordinates: [10, 20]
                    }
                };

            expect(SearchInterface1.normalizeResultEvents(resultEvents, searchResult)).to.deep.equals(
                {
                    onClick: {
                        setMarker: {
                            closeResults: true,
                            coordinates: [10, 20]
                        },
                        zoomToFeature: {
                            closeResults: true,
                            coordinates: [10, 20]
                        }
                    },
                    onHover: {
                        setMarker: {
                            closeResults: true,
                            coordinates: [10, 20]
                        }
                    }
                }
            );
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {
            const searchResult = {
                name: "Result Name1",
                type: "street",
                geometry: {
                    coordinates: [10, 20]
                }
            };

            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(
                {
                    setMarker: {
                        closeResults: true,
                        coordinates: [10, 20]
                    },
                    zoomToFeature: {
                        closeResults: true,
                        coordinates: [10, 20]
                    }
                }
            );
        });
    });
});
