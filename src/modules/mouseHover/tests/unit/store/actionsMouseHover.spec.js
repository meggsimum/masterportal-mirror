import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsMouseHover";
import stateMouseHover from "../../../store/stateMouseHover";
import Map from "ol/Map";


describe("src/modules/mouseHover/store/actionsMouseHover", () => {
    let commit, dispatch, state, olMap;

    beforeEach(() => {
        olMap = new Map();
        olMap.addOverlay = sinon.spy();
        commit = sinon.spy();
        dispatch = sinon.spy();
        Config = {
            mouseHover: {
                numFeaturesToShow: 2,
                infoText: "Infotext aus Config"
            }
        };
        state = {...stateMouseHover};
        mapCollection.clear();
        mapCollection.addMap(olMap, "2D");
    });
    afterEach(sinon.restore);

    describe("initialize", () => {
        it("initializes the mouseHover module", () => {
            actions.initialize({state, commit, dispatch});
            expect(mapCollection.getMap("2D").addOverlay.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setMouseHoverLayers");
            expect(commit.secondCall.args[0]).to.equal("setMouseHoverInfos");
            expect(commit.args[2]).to.eql(["setNumFeaturesToShow", 2]);
            expect(commit.args[3]).to.eql(["setInfoText", "(weitere Objekte. Bitte zoomen.)"]);
        });
    });

    describe("filterInfos", () => {
        const features = [{getProperties: () => {
            return {name: "erstesFeature", id: "123"};
        }, getLayerId: () => {
            return "layerId-1";
        }}, {getProperties: () => {
            return {name: "zweitesFeature", kategorie: "456"};
        }, getLayerId: () => {
            return "layerId-2";
        }}];

        it("filters the infos from each feature", () => {
            state.mouseHoverInfos = [{id: "layerId-1", mouseHoverField: ["name", "id"]}, {id: "layerId-2", mouseHoverField: ["name", "kategorie"]}];
            actions.filterInfos({state, commit}, features);
            expect(commit.firstCall.args[0]).to.equal("setPleaseZoom");
            expect(commit.firstCall.args[1]).to.equal(false);
            expect(commit.secondCall.args[0]).to.equal("setInfoBox");
            expect(commit.args[3]).to.eql(["setInfoBox", [["erstesFeature", "123"], ["zweitesFeature", "456"]]]);
        });
    });
});
