import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import PrintComponent from "../../../components/PrintMap.vue";
import Print from "../../../store/indexPrint";
import sinon from "sinon";
import mapCollection from "../../../../../../core/dataStorage/mapCollection.js";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/Print/components/PrintMap.vue", () => {
    const scales = ["1000", "5000", "10000"],
        mockMapGetters = {
            scales: () => scales,
            scale: sinon.stub(),
            getView: sinon.stub()
        },
        mockMapActions = {
            setResolutionByIndex: sinon.stub()
        },
        mockGfiGetters = {
            currentFeature: () => sinon.stub()
        };
    let store,
        wrapper,
        map = null;

    before(() => {
        map = {
            id: "ol",
            mode: "2D",
            render: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "ol", "2D");
    });

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Print,
                        Gfi: {
                            namespaced: true,
                            getters: mockGfiGetters
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    actions: mockMapActions
                }
            }
        });

        store.commit("Tools/Print/setActive", true);

        wrapper = mount(PrintComponent, {store, localVue});
    });

    describe("template", () => {
        it("should have an existing title", () => {
            expect(wrapper.find("#printToolNew")).to.exist;
        });

        it("should have a close button", () => {
            expect(wrapper.find(".bi-x-lg")).to.exist;
        });

        it("should emitted close event if button is clicked", async () => {
            const button = wrapper.find(".bi-x-lg");

            expect(button).to.exist;

            button.trigger("click");
            expect(wrapper.emitted()).to.have.property("close");
            expect(wrapper.emitted().close).to.have.lengthOf(1);
        });

        it("should have a dropdown for layouts", () => {
            expect(wrapper.find("#printLayout").exists()).to.be.true;
        });
        it("should have a dropdown for formats", () => {
            expect(wrapper.find("#printFormat").exists()).to.be.true;
        });
        it("should have a dropdown for scales", () => {
            expect(wrapper.find("#printScale").exists()).to.be.true;
        });

        it("should have a downloads container", () => {
            expect(wrapper.find("#tool-print-downloads-container").exists()).to.be.true;
        });

        it("should show finish download file", () => {
            store.commit("Tools/Print/setFileDownloads", [{
                index: 0,
                title: "Micky",
                finishState: true,
                downloadUrl: "https://example.test",
                filename: "Maus"
            }]);

            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.find("#tool-print-downloads-container").exists()).to.be.true;
            expect(wrapper.find(".tool-print-download-title-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-title").exists()).to.be.true;
            expect(wrapper.find(".tool-print-download-icon-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-loader").exists()).to.be.false;
            expect(wrapper.find("#tool-print-download-icon").exists()).to.be.true;
            expect(wrapper.find(".tool-print-download-button-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-button-active").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-button-disabled").exists()).to.be.false;
        });

        it("should show loader download file", () => {
            store.commit("Tools/Print/setFileDownloads", [{
                index: 1,
                title: "Donald",
                finishState: false,
                downloadUrl: "https://example.test",
                filename: "Duck"
            }]);

            wrapper = mount(PrintComponent, {store, localVue});

            expect(wrapper.find("#tool-print-downloads-container").exists()).to.be.true;
            expect(wrapper.find(".tool-print-download-title-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-title").exists()).to.be.true;
            expect(wrapper.find(".tool-print-download-icon-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-loader").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-icon").exists()).to.be.false;
            expect(wrapper.find(".tool-print-download-button-container").exists()).to.be.true;
            expect(wrapper.find("#tool-print-download-button-active").exists()).to.be.false;
            expect(wrapper.find("#tool-print-download-button-disabled").exists()).to.be.true;
        });
    });

    describe("returnScale", () => {
        it("should return an empty string if anything but a number is given", () => {
            expect(wrapper.vm.returnScale(undefined)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale(null)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale("string")).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale(true)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale(false)).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale([])).to.be.a("string").and.to.be.empty;
            expect(wrapper.vm.returnScale({})).to.be.a("string").and.to.be.empty;
        });
        it("should return the given scale untouched if any number below 10.000 is given", () => {
            expect(wrapper.vm.returnScale(9999)).to.equal("9999");
            expect(wrapper.vm.returnScale(1)).to.equal("1");
            expect(wrapper.vm.returnScale(0)).to.equal("0");
            expect(wrapper.vm.returnScale(-1)).to.equal("-1");
            expect(wrapper.vm.returnScale(-999999)).to.equal("-999999");
        });
        it("should return the given scale with spaces as thousands separators if any number above 9.999 is given", () => {
            expect(wrapper.vm.returnScale(10000)).to.equal("10 000");
            expect(wrapper.vm.returnScale(999999)).to.equal("999 999");
            expect(wrapper.vm.returnScale(1000000)).to.equal("1 000 000");
        });
    });
});
