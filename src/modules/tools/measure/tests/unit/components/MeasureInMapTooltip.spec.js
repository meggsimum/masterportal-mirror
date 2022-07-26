import Vuex from "vuex";
import {Polygon, LineString} from "ol/geom.js";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import {Style} from "ol/style.js";

import MeasureInMapTooltipComponent from "../../../components/MeasureInMapTooltip.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/measure/components/MeasureInMapTooltip.vue", () => {
    let store;

    /**
     * Creates a store depending on given params.
     * @param {boolean} isBeingDrawnLine sets isBeingDrawn at feature in state.lines
     * @param {boolean} isBeingDrawnPoly sets isBeingDrawn at feature in state.polygons
     * @param {string} featureId current feature id
     * @param {string} selectedGeometry current selected geometry
     * @returns {void}
     */
    function createStore (isBeingDrawnLine = true, isBeingDrawnPoly = false, featureId = "lineId", selectedGeometry = "LineString") {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Measure: {
                            namespaced: true,
                            getters: {
                                tooltipCoord: () => [[0, 0], [1000, 0]],
                                selectedGeometry: () => selectedGeometry,
                                lines: () => ({lineId: {
                                    get: key => ({
                                        isBeingDrawn: isBeingDrawnLine
                                    })[key],
                                    ol_uid: "lineId",
                                    getGeometry: () => new LineString([[0, 0], [1000, 0]])
                                }}),
                                polygons: () => ({polygonId: {
                                    get: key => ({
                                        isBeingDrawn: isBeingDrawnPoly
                                    })[key],
                                    ol_uid: "polygonId",
                                    getGeometry: () => new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]])
                                }}),
                                lineLengths: () => ({lineId: "500 m"}),
                                polygonAreas: () => ({polygonId: "500 m²"}),
                                featureId: () => featureId,
                                layer: () => new VectorLayer({
                                    name: "measureLayer",
                                    source: new VectorSource(),
                                    alwaysOnTop: true,
                                    style: new Style()
                                })
                            }
                        }
                    }
                }
            }
        });
    }

    it("LineString: generateTextPoint creates a tooltip-feature with 2 styles", () => {
        createStore();
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
                store,
                localVue
            }),
            tp = wrapper.vm.generateTextPoint("lineId"),
            style = tp.style_;

        expect(tp).not.to.be.null;
        expect(style.length).to.be.equals(2);
        expect(style[0].text_.text_).to.be.equals("0");
        expect(style[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
        expect(tp.getGeometry().getLastCoordinate()).to.deep.equal([1000, 0]);
    });
    it("LineString: setValueAtTooltipLayer changes text of style", () => {
        createStore();
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
            store,
            localVue
        });
        let style = null;

        wrapper.vm.currentTextPoint = wrapper.vm.generateTextPoint("lineId");
        wrapper.vm.layer.getSource().addFeature(wrapper.vm.currentTextPoint);
        wrapper.vm.setValueAtTooltipLayer({lineId: "500 m"});
        style = wrapper.vm.currentTextPoint.style_;

        expect(wrapper.vm.currentTextPoint).not.to.be.null;
        expect(style.length).to.be.equals(2);
        expect(style[0].text_.text_).to.be.equals("500 m");
        expect(style[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
    });
    it("LineString: generateTextStyles returns two styles with measure content", () => {
        createStore();
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
                store,
                localVue
            }),
            feature = {
                get: key => ({
                    isBeingDrawn: true
                })[key],
                getGeometry: () => new LineString([[0, 0], [1000, 0]])
            },
            styles = wrapper.vm.generateTextStyles(feature, "200m");

        expect(styles.length).to.be.equals(2);
        expect(styles[0].text_.text_).to.be.equals("200m");
        expect(styles[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
    });
    it("does not render complete tooltips for finished features", () => {
        createStore(false);
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
                store,
                localVue
            }),

            tp = wrapper.vm.generateTextPoint("lineId"),
            style = tp.style_;

        expect(tp).not.to.be.null;
        expect(style.length).to.be.equals(2);
        expect(style[0].text_.text_).to.be.equals("0");
        // testing text not null, else it cannot be printed
        expect(style[1].text_.text_).not.to.be.null;
        expect(style[1].text_.text_).to.be.equals("");
    });
    it("Polygon: generateTextPoint creates a tooltip-feature with 2 styles", () => {
        createStore(false, true, "polygonId");
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
                store,
                localVue
            }),
            tp = wrapper.vm.generateTextPoint("polygonId"),
            style = tp.style_;

        expect(tp).not.to.be.null;
        expect(style.length).to.be.equals(2);
        expect(style[0].text_.text_).to.be.equals("0");
        expect(style[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
        expect(tp.getGeometry().getLastCoordinate()).to.deep.equal([0, 1000]);
    });
    it("Polygon: generateTextStyles returns two styles with measure content", () => {
        createStore(false, true, "polygonId");
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
                store,
                localVue
            }),
            feature = {
                get: key => ({
                    isBeingDrawn: true
                })[key],
                getGeometry: () => new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]])
            },
            styles = wrapper.vm.generateTextStyles(feature, "200m");

        expect(styles.length).to.be.equals(2);
        expect(styles[0].text_.text_).to.be.equals("200m");
        expect(styles[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
    });
    it("Polygon: setValueAtTooltipLayer changes text of style", () => {
        createStore(false, true, "polygonId", "Polygon");
        const wrapper = shallowMount(MeasureInMapTooltipComponent, {
            store,
            localVue
        });
        let style = null;

        wrapper.vm.currentTextPoint = wrapper.vm.generateTextPoint("polygonId");
        wrapper.vm.layer.getSource().addFeature(wrapper.vm.currentTextPoint);
        wrapper.vm.setValueAtTooltipLayer({polygonId: "500 m"});
        style = wrapper.vm.currentTextPoint.style_;

        expect(wrapper.vm.currentTextPoint).not.to.be.null;
        expect(style.length).to.be.equals(2);
        expect(style[0].text_.text_).to.be.equals("500 m");
        expect(style[1].text_.text_).to.be.equals("modules.tools.measure.finishWithDoubleClick");
    });
});
