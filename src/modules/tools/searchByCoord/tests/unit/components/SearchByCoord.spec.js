import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SearchByCoordComponent from "../../../components/SearchByCoord.vue";
import SearchByCoord from "../../../store/indexSearchByCoord";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/searchByCoord/components/SearchByCoord.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        searchByCoord:
                            {
                                "name": "translate#common:menu.tools.searchByCoord",
                                "icon": "bi-record-circle",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SearchByCoord
                    }
                },
                Map: {
                    namespaced: true
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub()
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/SearchByCoord/setCoordinatesEasting", {id: "easting", value: "560416.25"});
        store.commit("Tools/SearchByCoord/setCoordinatesNorthing", {id: "easting", value: "5929401.90"});
        store.commit("Tools/SearchByCoord/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", true);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.true;
    });

    it("not renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", false);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.false;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue, attachTo: elem});

        wrapper.vm.setFocusToFirstControl();

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#coordSystemField").element).to.equal(document.activeElement);
    });

    describe("SearchByCoord.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(SearchByCoordComponent, {store, localVue});
            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SearchByCoord.active).to.be.false;
            expect(wrapper.find("#search-by-coord").exists()).to.be.false;
        });
        it("close resets input fields", async () => {
            wrapper = shallowMount(SearchByCoordComponent, {store, localVue});
            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SearchByCoord.coordinatesEasting.value).to.be.a("string").to.have.a.lengthOf(0);
            expect(store.state.Tools.SearchByCoord.coordinatesNorthing.value).to.be.a("string").to.have.a.lengthOf(0);
        });
    });

});
