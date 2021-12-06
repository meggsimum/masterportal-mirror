import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingDurationDisplayComponent from "../../../components/RoutingDurationDisplay.vue";
import Routing from "../../../store/indexRouting";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingDurationDisplay.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        routing:
                            {
                                "name": "translate#common:menu.tools.routing",
                                "icon": "bi-signpost-2",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });

        props = {
            duration: 1
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingDurationDisplayComponent", () => {
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("span").exists()).to.be.true;
    });

    it("renders duration < 60 as '1 min'", () => {
        props.duration = 1;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("span").text()).equal("< 1 min");
    });

    it("renders duration < 3600 as minutes", () => {
        props.duration = 3599;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("span").text()).equal("59 min");
    });

    it("renders duration >= 3600 as hours", () => {
        props.duration = 3600;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("span").text()).equal("1 h");
    });

    it("renders duration >= 3600 as hours with remaining minutes", () => {
        props.duration = 3660;
        wrapper = shallowMount(RoutingDurationDisplayComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".minutesminushours").text()).equal("1 min");
    });
});
