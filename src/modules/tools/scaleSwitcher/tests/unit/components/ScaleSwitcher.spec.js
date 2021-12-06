import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/scaleSwitcher/components/ScaleSwitcher.vue", () => {
    const scales = ["1000", "5000", "10000"],
        mockMapGetters = {
            scales: () => scales,
            scale: sinon.stub(),
            getView: sinon.stub()
        },
        mockMapActions = {
            setResolutionByIndex: sinon.stub()
        },
        mockMapMutations = {
            setScale: sinon.stub()
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            scaleSwitcher:
                            {
                                "name": "translate#common:menu.tools.scaleSwitcher",
                                "icon": "bi-arrows-angle-contract",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };
    let store, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ScaleSwitcher
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/ScaleSwitcher/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders the scaleSwitcher", () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.true;
    });

    it("do not render the scaleSwitchers select if not active", () => {
        store.commit("Tools/ScaleSwitcher/setActive", false);
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });

    it("has initially set all scales to select", () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});
        const options = wrapper.findAll("option");

        expect(options.length).to.equal(scales.length);
        scales.forEach((scale, index) => {
            expect(scale).to.equal(options.at(index).attributes().value);
        });
    });

    it("has initially selected scale", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});
        const select = wrapper.find("select");

        expect(select.element.value).to.equals("1000");
    });

    it("renders the correct value when select is changed", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});
        const select = wrapper.find("select"),
            options = wrapper.findAll("option");

        select.setValue(options.at(1).element.value);
        await wrapper.vm.$nextTick();
        expect(wrapper.find("select").element.value).to.equals("5000");
        select.setValue(options.at(2).element.value);
        await wrapper.vm.$nextTick();
        expect(wrapper.find("select").element.value).to.equals("10000");
    });

    it("calls store action setResolutionByIndex when select is changed", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});
        const select = wrapper.find("select"),
            options = wrapper.findAll("option");

        mockMapActions.setResolutionByIndex.reset();
        select.setValue(options.at(2).element.value);
        await wrapper.vm.$nextTick();
        expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue, attachTo: elem});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#scale-switcher-select").element).to.equal(document.activeElement);
    });

    it("method close sets active to false", async () => {
        wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        wrapper.vm.close();
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.active).to.be.false;
        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });
});
