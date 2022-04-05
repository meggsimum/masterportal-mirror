import {expect} from "chai";
import getters from "../../../store/gettersFeatureLister";
const {featureProperties, featureDetails, headers} = getters;

describe("tools/featureLister/store/gettersFeatureLister", () => {
    const gfiFeature1 = {
            getAttributesToShow: () => "showAll",
            getProperties: () => ({generic: "Hallo", alpha: "Dies", beta: "ist", gamma: "ein", delta: "Test"})
        },
        gfiFeature2 = {
            getAttributesToShow: () => ({generic: "Show Generic", alpha: "Show Alpha"}),
            getProperties: () => ({generic: "Test", alpha: "ohne", beta: "Gamma und Delta"})
        },
        gfiFeature3 = {
            getAttributesToShow: () => ({generic: "Show Generic", beta: "Show Beta"}),
            getProperties: () => ({generic: "Test", alpha: "ohne", beta: "", gamma: "Delta"})
        },
        listOfHeaders = {
            mapHeaders: (list) => Object.fromEntries(list.map(({key, value}) => [key, value]))
        };

    let state;

    beforeEach(() => {
        state = {};
        Config.ignoredKeys = [];
    });

    describe("headers", () => {
        it("lists all used attributes", () => {
            state.gfiFeaturesOfLayer = [gfiFeature2, gfiFeature3];
            expect(listOfHeaders.mapHeaders(headers(state))).to.deep.equal({generic: "Show Generic", alpha: "Show Alpha", beta: "Show Beta"});
        });
        it("shows all properties with showAll feature", () => {
            state.gfiFeaturesOfLayer = [gfiFeature1, gfiFeature2];
            expect(Object.keys(listOfHeaders.mapHeaders(headers(state)))).to.deep.equal(["generic", "alpha", "beta", "gamma", "delta"]);
        });
    });

    describe("featureDetails", () => {
        const mapFeatureDetails = Object.fromEntries;

        it("returns the exactly the attribute titles and values that are to show", () => {
            state.selectedFeature = gfiFeature2;
            expect(mapFeatureDetails(featureDetails(state))).to.deep.equal({"Show Generic": "Test", "Show Alpha": "ohne"});
        });
        it("returns all attribute values if showAll is set", () => {
            state.selectedFeature = gfiFeature1;
            expect(mapFeatureDetails(featureDetails(state))).to.deep.equal(gfiFeature1.getProperties());
        });
        it("ignores globally hidden keys if showAll is set", () => {
            state.selectedFeature = gfiFeature1;
            Config.ignoredKeys = ["alpha", "beta", "gamma", "delta"].map(it => it.toUpperCase());
            expect(mapFeatureDetails(featureDetails(state))).to.deep.equal({generic: "Hallo"});
        });
        it("ignores false-ish values", () => {
            state.selectedFeature = gfiFeature3;
            expect(mapFeatureDetails(featureDetails(state))).to.deep.equal({"Show Generic": "Test"});
        });
    });

    describe("featureProperties", () => {
        it("returns a nested array with equal length for each row", () => {
            state.headers = ["generic", "gamma"].map(it => ({key: it, value: "The " + it}));
            state.gfiFeaturesOfLayer = [gfiFeature2, gfiFeature3];
            expect(featureProperties(state)).to.deep.equal([["Test", ""], ["Test", "Delta"]]);
        });
    });
});
