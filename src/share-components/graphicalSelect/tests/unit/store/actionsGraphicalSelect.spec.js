import {expect} from "chai";
import actions from "../../../store/actionsGraphicalSelect";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Polygon from "ol/geom/Polygon";
import Feature from "ol/Feature";
import Draw from "ol/interaction/Draw.js";
import Overlay from "ol/Overlay.js";


describe("src/share-components/graphicalSelect/store/actionsGraphicalSelect", () => {
    let commit, dispatch, context;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    it("setDrawInteractionListener defines a drawstart and drawend function on the interaction", async () => {
        const layer = new VectorLayer({
                name: "Geometry-Selection",
                source: new VectorSource(),
                alwaysOnTop: true
            }),
            interaction = new Draw({
                source: "",
                type: "Polygon",
                geometryFunction: undefined
            }),
            payload = {layer: layer, interaction: interaction};

        await actions.setDrawInteractionListener({dispatch, commit}, payload);

        expect(payload.interaction.listeners_.drawstart).to.have.length(1);
        expect(payload.interaction.listeners_.drawend).to.have.length(1);

    });
    it("featureToGeoJson accepts ol feature and returns it as GeoJSON", async () => {
        const polygon = new Polygon([[
                [11.549606597773037, 48.17285700012215],
                [11.600757126507961, 48.179280978813836],
                [11.57613610823175, 48.148267667042006],
                [11.549606597773037, 48.17285700012215]
            ]]),
            feature = new Feature({
                geometry: polygon
            });

        expect(await actions.featureToGeoJson(context, feature)).to.eql({
            type: "Polygon",
            coordinates: [[[11.549606597773037, 48.17285700012215], [11.600757126507961, 48.179280978813836], [11.57613610823175, 48.148267667042006], [11.549606597773037, 48.17285700012215]]]});
    });
    it("showTooltipOverlay sets tooltipOverlay text for polygon", async () => {
        const state = {
                tooltipOverlay: new Overlay({
                    offset: [15, 20],
                    positioning: "top-left"
                }),
                currentValue: "Polygon",
                tooltipMessagePolygon: "MessagePolygon"
            },
            rootState = {
                Map: {
                    mouseCoord: [11.549606597773037, 48.17285700012215]
                }
            };

        await actions.showTooltipOverlay({state, rootState});

        expect(state.tooltipOverlay.element.innerHTML).to.eql(state.tooltipMessagePolygon);

    });
    it("showTooltipOverlay sets tooltipOverlay position coordinates", async () => {
        const state = {
                tooltipOverlay: new Overlay({
                    offset: [15, 20],
                    positioning: "top-left"
                }),
                currentValue: "Polygon",
                tooltipMessagePolygon: "MessagePolygon"
            },
            rootState = {
                Map: {
                    mouseCoord: [11.549606597773037, 48.17285700012215]
                }
            };

        await actions.showTooltipOverlay({state, rootState});

        expect(state.tooltipOverlay.getPosition()).to.eql(rootState.Maps.mouseCoordinate);

    });
    it("toggleOverlay adds overlayCircle for type Circle with Radio.trigger", () => {
        const payload = {
                type: "Circle",
                overlayCircle: {},
                overlayTool: {}
            },
            radioTrigger = sinon.spy(Radio, "trigger");

        actions.toggleOverlay(context, payload);

        expect(radioTrigger.calledWithExactly("Map", "addOverlay", payload.overlayCircle)).to.be.true;
        expect(radioTrigger.calledWithExactly("Map", "addOverlay", payload.overlayTool)).to.be.true;

    });
    it("createDomOverlay creates div with id", () => {
        const payload = {
            id: "1",
            overlay: {
                element: ""
            }
        };

        actions.createDomOverlay(context, payload);
        expect(payload.overlay.element.tagName).to.eql("DIV");
        expect(payload.overlay.element.id).to.eql("1");

    });
});
