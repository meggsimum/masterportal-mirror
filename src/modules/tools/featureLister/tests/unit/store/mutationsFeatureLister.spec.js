import {expect} from "chai";
import mutations from "../../../store/mutationsFeatureLister";

describe("tools/featureLister/store/mutationsFeatureLister", () => {
    const state = {
        layer: {name: "ersterLayer", id: "1", features: [{name: "erstesFeature", id: "123"}, {name: "zweitesFeature", id: "456"}, {name: "drittesFeature", id: "789"}]},
        rawFeaturesOfLayer: null,
        setGfiFeaturesOfLayer: null,
        nestedFeatures: false,
        selectedFeature: null,
        layerListView: true,
        featureListView: false,
        featureDetailView: false
    };

    describe("setGfiFeaturesOfLayer", () => {
        it("sets the rawFeatures and gfiFeatures of a layer to state", () => {
            const layers = [
                {name: "ersterLayer", values_: {id: "1"}, get: () => "1"},
                {name: "zweiterLayer", values_: {id: "2"}, get: () => "2"},
                {name: "dritterLayer", values_: {id: "3"}, get: () => "3"}];

            mutations.setGfiFeaturesOfLayer(state, layers);
            expect(state.rawFeaturesOfLayer).to.eql([{name: "erstesFeature", id: "123"}, {name: "zweitesFeature", id: "456"}, {name: "drittesFeature", id: "789"}]);
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getAttributesToShow");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getDocument");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getFeatures");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getGfiUrl");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getId");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getLayerId");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getMimeType");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getOlFeature");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getProperties");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getTheme");
            expect(state.gfiFeaturesOfLayer[0]).to.have.property("getTitle");
        });
    });

    describe("resetToThemeChooser", () => {
        it("resets the state to display the themeChooser tab", () => {
            state.selectedFeature = {name: "dasAuserwählte", id: "123"};
            state.layerListView = false;
            state.featureListView = true;

            mutations.resetToThemeChooser(state);
            expect(state.selectedFeature).to.eql(null);
            expect(state.layerListView).to.eql(true);
            expect(state.featureListView).to.eql(false);
        });
    });
});
