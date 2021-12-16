import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import PortalFooterComponent from "../../../components/PortalFooter.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

localVue.use(Vuex);

describe("src/modules/portalFooter/components/PortalFooter.vue", () => {
    const urls = [{
            "bezeichnung": "abc",
            "url": "https://abc.de",
            "alias": "ABC",
            "alias_mobil": "ABC"
        },
        {
            "bezeichnung": "",
            "url": "",
            "alias": "SDP Download",
            "toolModelId": "SdpDownload"
        }],
        mockConfigJs = {
            footer: {
                urls: urls,
                showVersion: false
            }
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                PortalFooter: {
                    namespaced: true,
                    getters: {
                        showFooter: () => true,
                        urls: () => urls,
                        showVersion: () => true
                    },
                    mutations: {
                        setShowFooter: () => sinon.stub(),
                        setShowVersion: () => sinon.stub()
                    },
                    actions: {
                        initialize: sinon.stub()
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        is3d: () => false
                    }
                }
            },
            state: {
                configJs: mockConfigJs
            },
            mutations: {
                configJs (state, value) {
                    state.configJs = value;
                }
            }
        });
    });
    afterEach(sinon.restore);

    it("renders the footer", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find("#portal-footer").exists()).to.be.true;
    });

    it("renders the masterportal version in footer", () => {
        store.commit("Footer/setShowVersion", true);
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find(".d-none.d-md-block").exists()).to.be.true;
    });

    it("renders the urls in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find("a").exists()).to.be.true;
        expect(wrapper.find("a").text()).to.equals("ABC");
        expect(wrapper.find("a").attributes().href).to.equals("https://abc.de");
    });
    it("renders link to start tool in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.at(1).exists()).to.be.true;
        expect(aTags.at(1).text()).to.equals("SDP Download");
    });

    it("renders scaleLine exist", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();
        expect(wrapper.find("scaleline-stub").exists()).to.be.true;
        expect(wrapper.find("scaleline-stub").classes()).to.not.includes("footer-scaleLine");
    });

    it("does not render tool-link for not supported tools in 3D", async () => {
        // mock Radio.request("Tool", "getSupportedIn3d");
        sinon.stub(Radio, "request").returns([]);

        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false,
                is3d: () => true
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.length).to.be.equals(1);
        expect(aTags.at(0).exists()).to.be.true;
        expect(aTags.at(0).text()).to.equals("ABC");
    });

    it("does render tool-link for supported tools in 3D", async () => {
        // mock Radio.request("Tool", "getSupportedIn3d");
        sinon.stub(Radio, "request").returns(["SdpDownload"]);

        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false,
                is3d: () => true
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.length).to.be.equals(2);
        expect(aTags.at(0).exists()).to.be.true;
        expect(aTags.at(0).text()).to.equals("ABC");
        expect(aTags.at(1).exists()).to.be.true;
        expect(aTags.at(1).text()).to.equals("SDP Download");
    });
});
