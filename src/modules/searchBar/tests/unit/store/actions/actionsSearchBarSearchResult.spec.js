import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../../store/actions/actionsSearchBarSearchResult";

const {
    activateLayerInTopicTree,
    addLayerToTopicTree,
    highligtFeature,
    openGetFeatureInfo,
    openTopicTree,
    setMarker
} = actions;

describe("src/modules/searchBar/store/actions/actionsSearchBarSearchResult.spec.js", () => {
    describe("activateLayerInTopicTree", () => {
        it("activateLayerInTopicTree", done => {
            testAction(activateLayerInTopicTree, {}, {}, {}, [
            ], {}, done);
        });
    });

    describe("addLayerToTopicTree", () => {
        it("addLayerToTopicTree", done => {
            testAction(addLayerToTopicTree, {}, {}, {}, [
            ], {}, done);
        });
    });

    describe("highligtFeature", () => {
        it("highligtFeature", done => {
            testAction(highligtFeature, {}, {}, {}, [
            ], {}, done);
        });
    });

    describe("openGetFeatureInfo", () => {
        it("openGetFeatureInfo", done => {
            testAction(openGetFeatureInfo, {}, {}, {}, [
            ], {}, done);
        });
    });

    describe("openTopicTree", () => {
        it("openTopicTree", done => {
            testAction(openTopicTree, {}, {}, {}, [
            ], {}, done);
        });
    });

    describe("setMarker", () => {
        it("setMarker", done => {
            testAction(setMarker, {}, {}, {}, [
            ], {}, done);
        });
    });
});
