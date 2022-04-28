import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import OrientationItemComponent from "../../../components/OrientationItem.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/OrientationItem.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    "controls":
                    {
                        "orientation":
                            {
                                "zoomMode": "once",
                                "poiDistances":
                                    [
                                        1000,
                                        5000,
                                        10000
                                    ]
                            }

                    }
                }
            }
        },

        mockGetters = {
            showPoiIcon: () => false,
            position: () => null,
            showPoiChoice: () => false,
            showPoi: () => false
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        orientation: {
                            namespaced: true,
                            getters: mockGetters
                        }
                    },
                    state: {
                        configJson: mockConfigJson
                    }
                }
            }
        });

        wrapper = shallowMount(OrientationItemComponent, {
            store,
            localVue
        });
    });

    it("renders the Orientation component", () => {
        expect(wrapper.find(".orientationButtons").exists()).to.be.true;
        expect(wrapper.find("#geolocation_marker").exists()).to.be.true;
    });

    it("renders the Orientation button", () => {
        expect(wrapper.find("#geolocate").exists()).to.be.true;
    });

    it("will not render the Poi Orientation button", () => {
        expect(wrapper.find("#geolocatePOI").exists()).to.be.false;
    });

    it("will union the array", () => {
        const arr1 = [3, 3, 4],
            arr2 = [5, 6, 7],
            arr = [3, 4, 5, 6, 7];

        expect(wrapper.vm.union(arr1, arr2, (obj1, obj2) => obj1 === obj2)).to.deep.equal(arr);
    });

});
