import Model from "@modules/tools/filter/model.js";
import sinon from "sinon";
import {expect} from "chai";

/**
 * Stubs the Radio request for ModelList
 * @returns {void}
 */
function fakeRadio () {
    sinon.stub(Radio, "request").callsFake(function (channel, topic) {
        if (channel === "ModelList" && topic === "getModelByAttributes") {
            return {
                has () {
                    return true;
                },
                get (key) {
                    if (key === "layerSource") {
                        return {
                            getFeatures () {
                                return [];
                            }
                        };
                    }
                    if (key === "typ") {
                        return "WFS";
                    }
                    return false;
                }
            };
        }

        return null;
    });
}

describe("modules/tools/filter/model", function () {
    let model;
    const predefinedQueries = [{
        "layerId": "8712",
        "isActive": false,
        "isSelected": false,
        "name": "Grundschulen",
        "predefinedRules": [
            {
                "attrName": "kapitelbezeichnung",
                "values": [
                    "Grundschulen",
                    "Langformschulen"
                ]
            }
        ],
        "attributeWhiteList": {
            "bezirk": "Bezirk",
            "stadtteil": "Stadtteil",
            "schulform": "Schulform",
            "ganztagsform": "Ganztagsform",
            "anzahl_schueler": "Anzahl Schüler",
            "schwerpunktschule": "Schwerpunktschule",
            "bilingual": "Bilingual"
        }
    }];

    before(function () {
        model = new Model();
        model.set("predefinedQueries", predefinedQueries);
        model.set("isInitialLoad", true);
    });

    describe("collectFilteredIds", function () {
        it("should return empty array for undefined input", function () {
            expect(model.collectFilteredIds(undefined))
                .to.be.an("array")
                .to.be.empty;
        });
    });

    describe("getQueryByTyp", function () {
        it("if \"GeoJSON\" should return valid model for geojson", function () {
            expect(model.getQueryByTyp("GeoJSON", null))
                .to.be.an("object");
        });

        it("if \"WFS\" should return valid model for geojson", function () {
            expect(model.getQueryByTyp("WFS", null))
                .to.be.an("object");
        });

        it("if \"GROUP\" should return valid object", function () {
            expect(model.getQueryByTyp("GROUP", null))
                .to.be.an("object");
        });

        it("if \"undefined\" should return null", function () {
            expect(model.getQueryByTyp(undefined, null))
                .to.be.null;
        });

        it("if \"null\" should return null", function () {
            expect(model.getQueryByTyp(null, null))
                .to.be.null;
        });

        it("if \"WMS\" as possible value should return null", function () {
            expect(model.getQueryByTyp("WMS", null))
                .to.be.null;
        });

        it("if \"Random String\" should return null", function () {
            expect(model.getQueryByTyp("-42-", null))
                .to.be.null;
        });
    });

    describe("radio requests", function () {
        it("should return isInitialLoad on 'getIsInitialLoad'", function () {
            expect(Radio.request("Filter", "getIsInitialLoad"))
                .to.equal(true);
        });
        it("should return String on 'getFilterName' if query exists", function () {
            expect(Radio.request("Filter", "getFilterName", "8712"))
                .to.equal("Grundschulen");
        });
        it("should return undefined on 'getFilterName' if query doesn't exists", function () {
            expect(Radio.request("Filter", "getFilterName", "foo"))
                .to.equal(undefined);
        });
        it("should return list of all filters on 'getFilters'", function () {
            expect(Radio.request("Filter", "getFilters"))
                .to.equal(predefinedQueries);
        });
    });

    describe("createQueries", function () {
        beforeEach(function () {
            fakeRadio();
        });
        afterEach(function () {
            sinon.restore();
            sinon.resetHistory();
        });
        it("queryCollection should be empty, if not called (before the tool is opened)", function () {
            expect(model.get("queryCollection").length).to.equal(0);
        });
        it("queryCollection should have one entry, if called once", function () {
            model.createQueries(model.get("predefinedQueries"));
            expect(model.get("queryCollection").length).to.equal(1);
        });
        it("queryCollection should not change, when opened again, but nothing changed", function () {
            model.createQueries(model.get("predefinedQueries"));
            expect(model.get("queryCollection").length).to.equal(1);
        });
        it("queryCollection should have two entries, if model is added on runtime", function () {
            const newFilterModel = {
                attributeWhiteList: ["some prop"],
                isActive: false,
                isSelected: false,
                layerId: "1234",
                name: "My filter"
            };

            model.get("predefinedQueries").push(newFilterModel);
            model.createQueries(model.get("predefinedQueries"));
            expect(model.get("queryCollection").length).to.equal(2);
        });
    });
});
