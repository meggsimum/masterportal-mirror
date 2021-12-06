import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import FileImportComponent from "../../../components/FileImport.vue";
import FileImport from "../../../store/indexFileImport";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/fileImport/components/FileImport.vue", () => {
    const
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            fileImport:
                            {
                                "name": "translate#common:menu.tools.fileImport",
                                "icon": "bi-arrows-angle-expand",
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
                        FileImport
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/FileImport/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders the fileImport", () => {
        wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.true;
    });

    it("do not render the fileImport tool if not active", () => {
        store.commit("Tools/FileImport/setActive", false);
        wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.find("#tool-file-import").exists()).to.be.false;
    });

    it("import method is initially set to \"auto\"", () => {
        wrapper = shallowMount(FileImportComponent, {store, localVue});

        expect(wrapper.vm.selectedFiletype).to.equal("auto");
    });
    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(FileImportComponent, {store, localVue, attachTo: elem});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".upload-button-wrapper").element).to.equal(document.activeElement);
    });
});
