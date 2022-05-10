import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsFeatureLister";

describe("tools/featureLister/store/actionsFeatureLister", () => {
    let commit, dispatch, rootGetters;

    document.body.innerHTML =
        "<div id=\"parent\">" +
        "   <div id=\"featureLister\">" +
        "       <p id=\"tool-feature-lister-list\" >Liste der Feature</p>" +
        "   </div>" +
        "   <ul class=\"feature-lister-navtabs\">" +
        "       <li id=\"tool-feature-lister-themeChooser\" >Liste der Layer</li>" +
        "       <li id=\"tool-feature-lister-list\" >Liste der Feature</li>" +
        "       <li id=\"tool-feature-lister-details\" >Detailansicht</li>" +
        "   </ul>" +
        "</div>";

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });
    afterEach(sinon.restore);

    describe("switchToList", () => {
        const layer = {name: "ersterLayer", id: "123", features: [{values_: {features: [1, 2]}}], geometryType: "Point"},
            state = {
                layer: layer,
                gfiFeaturesOfLayer: [{erstesFeature: "first"}, {zweitesFeature: "second"}, {drittesFeature: "third"}]
            };

        it("switches to the feature list view", () => {
            actions.switchToList({state, rootGetters, commit, dispatch}, layer);
            expect(commit.firstCall.args[0]).to.equal("setLayer");
            expect(commit.firstCall.args[1]).to.equal(layer);
            expect(commit.secondCall.args[0]).to.equal("setLayerId");
            expect(commit.thirdCall.args[0]).to.equal("setGfiFeaturesOfLayer");
        });
    });

    describe("clickOnFeature", () => {
        it("handles the click event when clicking in a feature in the feature list view", () => {
            const featureIndex = 1,
                state = {
                    shownFeatures: 20,
                    gfiFeaturesOfLayer: [{erstesFeature: "first"}, {zweitesFeature: "second"}, {drittesFeature: "third"}],
                    rawFeaturesOfLayer: [{getGeometry: () => "Point"}, {getGeometry: () => "Point"}],
                    layer: {
                        geometryType: "Point"
                    }
                };

            rootGetters = {"Maps/getView": {fit: () => true}};

            actions.clickOnFeature({state, commit, dispatch, rootGetters}, featureIndex);
            expect(commit.firstCall.args[0]).to.equal("setSelectedFeature");
            expect(commit.firstCall.args[1]).to.eql(state.gfiFeaturesOfLayer[1]);
        });
    });

    describe("hoverOverFeature", () => {
        const state = {
            shownFeatures: 20,
            nestedFeatures: false,
            layer: {features: [{erstesFeature: "first", getId: () => "1"}, {zweitesFeature: "second", getId: () => "2"}, {drittesFeature: "third", getId: () => "3"}]},
            rawFeaturesOfLayer: [{erstesFeature: "first", getId: () => "1"}, {zweitesFeature: "second", getId: () => "2"}, {drittesFeature: "third", getId: () => "3"}]
        };

        it("handles the hover event when hovering over a feature in the feature list view", () => {

            actions.hoverOverFeature({state, dispatch}, 1);
            expect(dispatch.firstCall.args[0]).to.equal("highlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("2");
        });
        it("handles the hover event when hovering over a nested feature in the feature list view", () => {

            state.nestedFeatures = true;
            actions.hoverOverFeature({state, dispatch}, 2);
            expect(dispatch.firstCall.args[0]).to.equal("highlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("3");
        });
    });

    describe("highlightFeature", () => {
        const state = {
            geometry: {getType: () => {
                "Point";
            }},
            source: {getFeatures: () => [{name: "feature", id: "1", getId: () => "1", getGeometry: () => state.geometry}]},
            visibleLayers: [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}],
            layer: {
                name: "ersterLayer",
                id: "123",
                styleId: "123",
                geometryType: "Point"
            },
            nestedFeatures: false,
            rawFeaturesOfLayer: [{name: "ersterLayer", id: "123", styleId: "123", getId: () => "123", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point", getGeometry: () => {
                return state.geometry;
            }}, {name: "zweiterLayer", id: "456", styleId: "456", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}, {name: "dritterLayer", id: "789", styleId: "789", features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}],
            highlightVectorRulesPolygon: {
                "fill": {
                    "color": [255, 0, 255, 0.9]
                },
                "stroke": {
                    "width": 4,
                    "color": [0, 0, 204, 0.9]
                },
                "zoomLevel": 5
            },
            highlightVectorRulesPointLine: {
                "stroke": {
                    "width": 8,
                    "color": [255, 0, 255, 0.9]
                },
                "image": {
                    "scale": 2
                },
                "zoomLevel": 5
            }
        };

        rootGetters = {"Maps/getVisibleLayerList": [
            {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
            {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
            {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}]
        };

        it("highlights a feature depending on its geometryType", () => {
            const featureId = "123";

            rootGetters = {"Maps/getVisibleLayerList": [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}]
            };

            actions.highlightFeature({state, rootGetters, dispatch}, featureId);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
        });
        it("highlights a nested feature depending on its geometryType", () => {
            const featureId = "123";

            rootGetters = {"Maps/getVisibleLayerList": [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}]
            };

            state.nestedFeatures = true;
            actions.highlightFeature({state, rootGetters, dispatch}, featureId);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeHighlightFeature");
            expect(dispatch.firstCall.args[1]).to.equal("decrease");
            expect(dispatch.secondCall.args[0]).to.equal("Maps/highlightFeature");
        });
    });

    describe("switchToThemes", () => {
        it("switches to the themes tab", () => {

            actions.switchToThemes({commit});
            expect(commit.firstCall.args[0]).to.equal("resetToThemeChooser");
        });
    });

    describe("switchToDetails", () => {
        it("switches to the details tab", () => {
            const state = {
                selectedFeature: true
            };

            actions.switchToDetails({state, commit});
            expect(commit.firstCall.args[0]).to.equal("setLayerListView");
            expect(commit.firstCall.args[1]).to.equal(false);
            expect(commit.secondCall.args[0]).to.equal("setFeatureListView");
            expect(commit.secondCall.args[1]).to.equal(false);
            expect(commit.thirdCall.args[0]).to.equal("setFeatureDetailView");
            expect(commit.thirdCall.args[1]).to.equal(true);
        });
    });

    describe("showMore", () => {
        const state = {
            shownFeatures: 20,
            featureCount: 100
        };

        it("adds ten more features to the list view if the total featureCount is big enough", () => {
            actions.showMore({state, commit, dispatch});
            expect(commit.firstCall.args[0]).to.equal("setShownFeatures");
            expect(commit.firstCall.args[1]).to.equal(30);
        });
        it("adds as many features as neccessary to meet the total featureCount", () => {
            state.featureCount = 25;

            actions.showMore({state, commit, dispatch});
            expect(commit.firstCall.args[0]).to.equal("setShownFeatures");
            expect(commit.firstCall.args[1]).to.equal(25);
        });
    });

});
