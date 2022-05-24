import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SelectFeaturesComponent from "../../../components/SelectFeatures.vue";
import SelectFeaturesModule from "../../../store/indexSelectFeatures";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/selectFeatures/components/SelectFeatures.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            "selectFeatures":
                            {
                                "name": "translate#common:menu.tools.selectFeatures"
                            }
                        }
                    }
                }
            }
        },
        mockMapActions = {
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub()
        },
        mockSelectedFeaturesWithRenderInformation = [
            {
                item: null,
                properties: [
                    ["Name", "Max-Brauer-Schule"],
                    ["Schulform", "Grundschule"],
                    ["Schulstandort", "Hauptstandort"],
                    ["Scherpunktschule Inklusion", ""]
                ]
            }
        ];

    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Maps: {
                    namespaced: true,
                    actions: mockMapActions
                },
                Tools: {
                    namespaced: true,
                    modules: {
                        SelectFeatures: SelectFeaturesModule
                    }
                }
            },
            getters: {
                uiStyle: () => true
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/SelectFeatures/setActive", true);
    });

    it("renders the SelectFeatures tool if active", () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.find("#selectFeatures").exists()).to.be.true;
        expect(wrapper.find(".selectFeaturesDefaultMessage").exists()).to.be.true;
    });

    it("do not render the SelectFeatures tool if not active", async () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue}),
            spyRemoveInteractions = sinon.spy(wrapper.vm, "removeInteractions");

        await store.commit("Tools/SelectFeatures/setActive", false);
        expect(spyRemoveInteractions.calledOnce).to.be.true;

        expect(wrapper.find("#selectFeatures").exists()).to.be.false;

        spyRemoveInteractions.restore();
    });

    it("renders the SelectFeatures-Table if it has data", async () => {
        await store.commit("Tools/SelectFeatures/setSelectedFeaturesWithRenderInformation", mockSelectedFeaturesWithRenderInformation);
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.find(".select-features-tables").exists()).to.be.true;
        expect(wrapper.find(".featureName").exists()).to.be.true;
        expect(wrapper.find(".featureValue").exists()).to.be.true;
        expect(wrapper.find(".select-features-zoom-link").exists()).to.be.true;
    });

    it("selectFeatures functions return correct results", async () => {
        const wrapper = shallowMount(SelectFeaturesComponent, {store, localVue});

        expect(wrapper.vm.beautifyKey("very_important_field")).to.equal("Very Important Field");
        expect(wrapper.vm.beautifyValue("very|important|field")).to.equal("very<br/>important<br/>field");
        expect(wrapper.vm.isValidValue("NULL")).to.equal(false);
        expect(wrapper.vm.isValidValue(1)).to.equal(false);
        expect(wrapper.vm.isValidValue("Wert")).to.equal(true);
    });
});
