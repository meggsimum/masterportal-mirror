import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingSpeedProfileIconComponent from "../../../components/RoutingSpeedProfileIcon.vue";
import Routing from "../../../store/indexRouting";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingSpeedProfileIcon.vue", () => {
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
            speedProfileId: "CAR",
            tooltip: "testtooltip"
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingSpeedProfileIconComponent", () => {
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("svg").exists()).to.be.true;
    });

    it("renders tooltip", () => {
        props.tooltip = "testtooltip";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find("title").exists()).to.be.true;
        expect(wrapper.find("title").text()).equal("testtooltip");
    });

    it("renders CAR icon", () => {
        props.speedProfileId = "CAR";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-CAR").exists()).to.be.true;
    });

    it("renders HGV icon", () => {
        props.speedProfileId = "HGV";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-HGV").exists()).to.be.true;
    });

    it("renders CYCLING icon", () => {
        props.speedProfileId = "CYCLING";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-CYCLING").exists()).to.be.true;
    });

    it("renders FOOT icon", () => {
        props.speedProfileId = "FOOT";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-FOOT").exists()).to.be.true;
    });

    it("renders WHEELCHAIR icon", () => {
        props.speedProfileId = "WHEELCHAIR";
        wrapper = shallowMount(RoutingSpeedProfileIconComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".routing-speed-profile-icon-WHEELCHAIR").exists()).to.be.true;
    });
});
