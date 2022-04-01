import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleLine from "../../../components/ScaleLine.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

// Test the ScaleLine component
describe("src/modules/scaleLine/components/ScaleLine.vue", () => {
    let wrapper;

    it("check mapMode normal -> do render", () => {
        wrapper = createWrapper(false, "2D", "1 : 60.000", "1.2 km", true);

        expect(wrapper.find("#scales").exists()).to.equal(true);
        expect(wrapper.find(".scale-line").text()).to.equals("1.2 km");
        expect(wrapper.find(".scale-as-a-ratio").text()).to.equals("1 : 60.000");
    });

    it("check mapMode Oblique -> do not render", () => {
        wrapper = createWrapper(false, "Oblique", "1 : 60.000", "1.2 km", true);

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    it("check mobile=true -> do not render", () => {
        wrapper = createWrapper(true, "2D", "1 : 60.000", "1.2 km", true);

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    it("check scaleLine=false -> do not render", () => {
        wrapper = createWrapper(false, "2D", "1 : 60.000", "1.2 km", false);

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    it("check scaleLine is not configured in configJs -> do not render", () => {
        wrapper = createWrapper(false, "2D", "1 : 60.000", "1.2 km", null);

        expect(wrapper.find("#scales").exists()).to.equal(false);
    });

    // TEARDOWN - run after to each unit test
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    /**
     * Helper Function to create a wrapper.
     * @param {boolean} mobile getter mobile
     * @param {number} mapMode getter mapMode
     * @param {string} scaleToOne  getter scaleToOne
     * @param {string} scaleWithUnit  getter scaleWithUnit
     * @param {object} scaleLineConfig  getter scaleLineConfig
     * @return {Object} the shallowMounted wrapper
     */
    function createWrapper (mobile, mapMode, scaleToOne, scaleWithUnit, scaleLineConfig) {
        return shallowMount(ScaleLine, {
            mocks: {
                $t: () => {
                    "scale of map";
                }
            },
            computed: {
                mobile: () => mobile,
                mode: () => mapMode,
                scaleToOne: () => scaleToOne,
                scaleWithUnit: () => scaleWithUnit,
                scaleLineConfig: () => scaleLineConfig
            },
            localVue
        });
    }

});
