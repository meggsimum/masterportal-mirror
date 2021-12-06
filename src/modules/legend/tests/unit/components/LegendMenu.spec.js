import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LegendMenuComponent from "../../../components/LegendMenu.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("LegendMenu.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    legend: {
                        name: "common:modules.legend.name",
                        icon: "bi-journal",
                        showCollapseAllButton: true
                    }
                }
            }
        },
        getters = {
            mobile: state => state.mobile,
            uiStyle: sinon.stub()
        },
        mutations = {
            setMobile (state, mobile) {
                state.mobile = mobile;
            }
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Legend
            },
            state: {
                configJson: mockConfigJson,
                mobile: false
            },
            getters,
            mutations
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("LegendMenu.vue rendering", () => {
        it("renders the legend in Menu", () => {
            wrapper = shallowMount(LegendMenuComponent, {store, localVue});

            expect(wrapper.find("#legend-menu").exists()).to.be.true;
        });
        it("renders the legend in mobile view", () => {
            store.commit("setMobile", true);
            wrapper = shallowMount(LegendMenuComponent, {store, localVue});
            expect(wrapper.find("#legend-menu.mobile").exists()).to.be.true;
        });
    });
    describe("LegendMenu.vue methods", () => {
        it("toggleLegend", () => {
            wrapper = shallowMount(LegendMenuComponent, {store, localVue});

            store.state.Legend.showLegend = false;
            wrapper.vm.toggleLegend();
            expect(store.state.Legend.showLegend).to.be.equals(true);
        });
    });
});
