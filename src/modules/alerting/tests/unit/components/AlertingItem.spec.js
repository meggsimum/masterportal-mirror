import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import AlertingStoreModule from "../../../store/indexAlerting";
import AlertingItemComponent from "../../../components/AlertingItem.vue";
import {expect} from "chai";
import sinon from "sinon";

const
    localVue = createLocalVue(),
    Storage = require("dom-storage");

global.localStorage = new Storage(null, {strict: true});
localVue.use(Vuex);
config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

describe("src/modules/alerting/components/AlertingItem.vue", function () {
    let
        wrapper,
        store;

    const
        mockConfigJs = {
            alerting: {
                fetchBroadcastUrl: "foo",
                localStorageDisplayedAlertsKey: "bar"
            }
        },
        alertingData = {
            data: {
                "globalAlerts": ["Test1", "Test4"],

                "restrictedAlerts": {
                    "https://localhost:9001/portal/master/": ["Test2"],
                    "https://localhost:9001/portal/basic/": ["Test3"]
                },

                "alerts": {
                    "Test1": {
                        "displayClass": "error",
                        "category": "Test 1",
                        "content": "Lorem Ipsum 1 (global content)",
                        "displayFrom": "2020-03-01 20:15:55",
                        "displayUntil": "2052-05-17 14:30",
                        "mustBeConfirmed": true,
                        "once": {"seconds": 15}
                    },
                    "Test2": {
                        "displayClass": "info",
                        "category": "Test 1",
                        "content": "Lorem Ipsum 2 (content for master)",
                        "displayFrom": false,
                        "displayUntil": "2052-05-17 14:30",
                        "mustBeConfirmed": false,
                        "once": {"seconds": 30}
                    },
                    "Test3": {
                        "displayClass": "error",
                        "category": "Test 2",
                        "content": "Lorem Ipsum 3 (content for basic)",
                        "displayFrom": false,
                        "displayUntil": "2052-05-17 14:30",
                        "mustBeConfirmed": true,
                        "once": {"seconds": 45}
                    },
                    "Test4": {
                        "displayClass": "warning",
                        "category": "Test 2",
                        "content": "Lorem Ipsum 4 (global content)",
                        "displayFrom": false,
                        "displayUntil": "2052-05-17 14:30",
                        "mustBeConfirmed": true,
                        "once": {"seconds": 60}
                    }
                }
            }
        };

    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                Alerting: AlertingStoreModule
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

    it("Checking the initially displayed alerts", async function () {
        const
            mountingSettings = {
                store,
                computed: {
                    currentUrl: () => "https://localhost:9001/portal/master/"
                },
                methods: {
                    fetchBroadcast: function () {
                        this.axiosCallback(alertingData);
                    }
                },
                localVue
            };

        let
            categoryContainers = [],
            alertWrappers = [];

        wrapper = shallowMount(AlertingItemComponent, mountingSettings);

        await wrapper.vm.$nextTick();

        categoryContainers = wrapper.findAll(".alertCategoryContainer");
        alertWrappers = wrapper.findAll(".singleAlertWrapper");

        describe("Expecting initially shown 2 category groups with 3 alerts", function () {
            it("There are 2 category groups", function () {
                expect(categoryContainers.exists()).to.be.true;
                expect(categoryContainers.length).to.equal(2);
            });

            it("1st category group is named \"Test 1\"", function () {
                expect(categoryContainers.at(0).find("h3").exists()).to.be.true;
                expect(categoryContainers.at(0).find("h3").text()).to.equal("Test 1");
            });
            it("and contains 2 alerts", function () {
                expect(categoryContainers.at(0).findAll(".singleAlertWrapper").length).to.equal(2);
            });

            it("1st alert is of category \"error\"", function () {
                expect(alertWrappers.at(0).classes().indexOf("error")).not.to.equal(-1);
            });
            it("and has a confirmation link", function () {
                expect(alertWrappers.at(0).find("p.confirm").exists()).to.be.true;
            });
            it("2nd alert is of category \"info\"", function () {
                expect(alertWrappers.at(1).classes().indexOf("info")).not.to.equal(-1);
            });
            it("and has no confirmation link", function () {
                expect(alertWrappers.at(1).find("p.confirm").exists()).to.be.false;
            });

            it("2st category group is named \"Test 2\"", function () {
                expect(categoryContainers.at(1).find("h3").exists()).to.be.true;
                expect(categoryContainers.at(1).find("h3").text()).to.equal("Test 2");
            });
            it("and contains 1 alert", function () {
                expect(categoryContainers.at(1).findAll(".singleAlertWrapper").length).to.equal(1);
            });

            it("3rd alert is of category \"warning\"", function () {
                expect(alertWrappers.at(2).classes().indexOf("warning")).not.to.equal(-1);
            });
            it("and has a confirmation link", function () {
                expect(alertWrappers.at(2).find("p.confirm").exists()).to.be.true;
            });
        });

        describe("Now clicking on 1st alert's confirmation link", function () {
            it("click", function () {
                alertWrappers.at(0).find("p.confirm a").trigger("click");
            });

            it("confirmation link of first alert is gone", function () {
                expect(wrapper.findAll(".singleAlertWrapper").at(0).find("p.confirm a").exists()).to.be.false;
            });
        });

        describe("Close the modal", function () {
            it("2 first alerts have vanished", async function () {
                wrapper.vm.onModalHid();
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertWrapper").length).to.equal(1);
            });
        });

        describe("Add some alerts", function () {
            it("2nd displayed alert is the new one", async function () {
                store.dispatch("Alerting/addSingleAlert", {
                    "displayClass": "error",
                    "category": "Test 1",
                    "content": "copycat",
                    "displayFrom": "2020-03-01 20:15:55",
                    "displayUntil": "2052-05-17 14:30",
                    "mustBeConfirmed": true,
                    "once": {"seconds": 15}
                });
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertContainer>div").at(1).text()).to.equal("copycat");
            });
            it("Adding the exact same alert again does nothing", async function () {
                store.dispatch("Alerting/addSingleAlert", {
                    "displayClass": "error",
                    "category": "Test 1",
                    "content": "copycat",
                    "displayFrom": "2020-03-01 20:15:55",
                    "displayUntil": "2052-05-17 14:30",
                    "mustBeConfirmed": true,
                    "once": {"seconds": 15}
                });
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertContainer").length).to.equal(2);
            });
            it("Adding an expired alert does nothing", async function () {
                store.dispatch("Alerting/addSingleAlert", {
                    "content": "No one ever looks at me only because I'm expired.",
                    "displayFrom": "2020-03-01 20:15:55",
                    "displayUntil": "2020-05-17 14:30",
                    "mustBeConfirmed": true,
                    "once": {"seconds": 15}
                });
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertContainer").length).to.equal(2);
            });
            it("Adding an alert from the future does nothing", async function () {
                store.dispatch("Alerting/addSingleAlert", {
                    "content": "I am too avant garde for this 'unalerted' society.",
                    "displayFrom": "2050-03-01 20:15:55",
                    "displayUntil": "2060-05-17 14:30"
                });
                await wrapper.vm.$nextTick();
                expect(wrapper.findAll(".singleAlertContainer").length).to.equal(2);
            });
        });
    });
});
