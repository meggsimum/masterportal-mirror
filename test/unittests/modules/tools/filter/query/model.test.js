import Model from "@modules/tools/filter/query/model.js";
import {expect} from "chai";

describe("modules/tools/filter/query/model", function () {
    let model;
    const featureAttributesMap = [
            {
                "displayName": "Bezirk",
                "name": "bezirk",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Altona", "Bergedorf", "Eimsbüttel", "Hamburg-Mitte", "Hamburg-Nord", "Harburg", "Wandsbek"]
            },
            {
                "displayName": "Stadtteil",
                "name": "stadtteil",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Allermöhe", "Alsterdorf", "Altona-Altstadt", "Altona-Nord", "Bahrenfeld", "Barmbek-Nord"]
            },
            {
                "displayName": "Gemarkung",
                "name": "gemarkung",
                "snippetType": "dropdown",
                "type": "text",
                "values": ["Allermöhe", "Alt-Rahlstedt", "Altona-Nord", "Altona-Südwest", "Bahrenfeld", "Barmbek", "Bergedorf", "Bergstedt"]
            }
        ],
        rules = [
            {
                "attrName": "bezirk",
                "values": ["Altona"]
            }
        ];

    before(function () {
        model = new Model();
    });

    describe("mapRules", function () {
        it("should return an array", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap).to.be.an("array");
        });

        it("should return an array with length three", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap).to.have.lengthOf(3);
        });

        it("should have 'preselectedValues' with the value 'Altona'", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap[0].preselectedValues).to.have.members(["Altona"]);
        });

        it("should be undefined for 'preselectedValues'", function () {
            const returnedFeatureAttributesMap = model.mapRules(featureAttributesMap, rules);

            expect(returnedFeatureAttributesMap[1].preselectedValues).to.be.an("undefined");
        });
    });

    describe("getTimestampValues", () => {
        it("should return an empty array if anything but an array is given", function () {
            expect(model.getTimestampValues(undefined)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues(null)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues("string")).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues(1234)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues(true)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues(false)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues({})).to.be.an("array").and.to.be.empty;
        });
        it("should return an empty array if anything but a string is given as format", function () {
            expect(model.getTimestampValues([], undefined)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], null)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], 1234)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], true)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], false)).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], {})).to.be.an("array").and.to.be.empty;
            expect(model.getTimestampValues([], [])).to.be.an("array").and.to.be.empty;
        });
        it("should return a sorted array of milliseconds", function () {
            expect(model.getTimestampValues([
                "01.06.2021",
                "01.04.2021",
                "01.05.2021"
            ], "DD.MM.YYYY")).to.deep.equal([
                new Date("2021-04-01T00:00:00").getTime(),
                new Date("2021-05-01T00:00:00").getTime(),
                new Date("2021-06-01T00:00:00").getTime()
            ]);
        });
    });
});
