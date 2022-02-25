import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import LayerItem from "../../../components/LayerItem.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filterGeneral/components/LayerItem.vue", () => {
    let wrapper;

    const layer =
        {
            "title": "Schüleranzahl-Filter",
            "layerId": "8712",
            "shortDescription": "foo bar",
            "service": {
                "type": "ol",
                "layerId": "8712",
                "url": "https://geodienste.hamburg.de/HH_WFS_Schulen",
                "typename": "staatliche_schulen"
            },
            "paging": 10,
            "snippets": [
                {
                    "attrName": "anzahl_schueler",
                    "label": "Anzahl der Schüler",
                    "minValue": 0,
                    "maxValue": 2000,
                    "operator": "BETWEEN",
                    "prechecked": [0, 2000],
                    "type": "sliderRange",
                    "visible": true
                }
            ]
        };

    beforeEach(() => {
        wrapper = shallowMount(LayerItem, {
            propsData: {
                layer
            },
            localVue
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render correctly", () => {
        expect(wrapper.find("div").classes("panel-heading")).to.be.true;
    });

    it("should render description", () => {
        const description = wrapper.findAll(".layerInfoText");

        expect(description.exists()).to.be.true;
    });

    it("should be disabled if passed as props", () => {
        wrapper = shallowMount(LayerItem, {
            propsData: {
                layer,
                disabled: true
            },
            localVue
        });
        expect(wrapper.find("div").classes("disabled")).to.be.true;
    });

});
