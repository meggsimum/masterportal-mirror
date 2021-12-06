import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import QuickHelpComponent from "../../../components/QuickHelp.vue";
import QuickHelp from "../../../store/indexQuickHelp";
import Vuex from "vuex";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/quickHelp/components/QuickHelp.vue", () => {
    const mockConfigJson = {
        "Portalconfig": {
            "quickHelp": {
                "configs": {
                    "search": true
                }
            }
        }
    };

    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                QuickHelp
            },
            state: {
                configJson: mockConfigJson
            }
        });

        wrapper = shallowMount(QuickHelpComponent, {store, localVue, propsData: {
            quickHelpConfigJsObject: true
        }});
    });
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("addSlashToImgPath", () => {
        it("returns given param if it is not a string", () => {
            expect(wrapper.vm.addSlashToImgPath(null)).to.be.null;
            expect(wrapper.vm.addSlashToImgPath(1234)).to.equal(1234);
            expect(wrapper.vm.addSlashToImgPath(true)).to.be.true;
            expect(wrapper.vm.addSlashToImgPath(false)).to.be.false;
            expect(wrapper.vm.addSlashToImgPath([])).to.be.an("array").and.to.be.empty;
            expect(wrapper.vm.addSlashToImgPath({})).to.be.an("object").and.to.be.empty;
            expect(wrapper.vm.addSlashToImgPath(undefined)).to.be.undefined;
        });
        it("returns given string with an trailing slash", () => {
            const imgPath = "path/to",
                expected = "path/to/";

            expect(wrapper.vm.addSlashToImgPath(imgPath)).to.equal(expected);
        });
    });

    describe("template", () => {
        it("should have a close button", () => {
            const localWrapper = shallowMount(QuickHelpComponent, {store, localVue, propsData: {
                    quickHelpConfigJsObject: true
                }}),
                button = localWrapper.find(".bi-x-lg");

            expect(button).to.exist;
        });
    });
});
