import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsMouseHover";
import stateMouseHover from "../../../store/stateMouseHover";


describe("tools/mouseHover/store/actionsMouseHover", () => {
    let commit, dispatch, rootState, state;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        rootState = {
            configJson: {Themenconfig: {
                Fachdaten: {
                    Layer: [
                        {
                            name: "TestLayer"
                        }
                    ]
                }
            }}
        };
        Config = {
            mouseHover: {
                numFeaturesToShow: 2,
                infoText: "Infotext aus Config"
            }
        };
        state = {...stateMouseHover};
    });
    afterEach(sinon.restore);

    describe("initialize", () => {
        const map = {
            id: "ol",
            mode: "2D",
            on: () => sinon.stub()
        };

        it("initializes the mouseHover module", () => {
            actions.initialize({state, rootState, commit, dispatch}, map);
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
            actions.filterInfos({state, commit, dispatch}, features);
            expect(commit.firstCall.args[0]).to.equal("setPleaseZoom");
            expect(commit.firstCall.args[1]).to.equal(false);
            expect(commit.secondCall.args[0]).to.equal("setInfoBox");
            expect(commit.args[3]).to.eql(["setInfoBox", [["erstesFeature", "123"], ["zweitesFeature", "456"]]]);
        });
    });
});
