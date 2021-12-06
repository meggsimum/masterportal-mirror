import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingCoordinateInputComponent from "../../../components/RoutingCoordinateInput.vue";
import Routing from "../../../store/indexRouting";
import {RoutingWaypoint} from "../../../utils/classes/routing-waypoint";
import {RoutingGeosearchResult} from "../../../utils/classes/routing-geosearch-result";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingCoordinateInput.vue", () => {
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
            waypoint: new RoutingWaypoint({
                index: 0,
                source: {
                    addFeature: () => sinon.spy()
                }
            }),
            countWaypoints: 0
        };
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingCoordinateInputComponent", () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        expect(wrapper.find(".form-group-sm.mb-4.mx-0").exists()).to.be.true;
    });

    it("renders info text on focus", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.find("input").element.focus();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".helptext").exists()).to.be.true;
    });

    it("hides info text on blur", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.find("input").element.focus();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".helptext").exists()).to.be.true;

        wrapper.find("input").element.blur();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".helptext").exists()).to.be.false;
    });

    it("emits moveWaypointUp", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        const input = wrapper.find(".bi-chevron-up");

        input.element.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().moveWaypointUp.length).equal(1);
    });

    it("emits moveWaypointDown", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        const input = wrapper.find(".bi-chevron-down");

        input.element.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().moveWaypointDown.length).equal(1);
    });

    it("emits removeWaypoint", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        const input = wrapper.find(".selfAlignCenter.pointer.bootstrap-icon.ml-4 > .bi-x-lg");

        input.element.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().removeWaypoint.length).equal(1);
    });

    it("renders resetInputButton", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.setData({search: "testsearch"});
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".bootstrap-icon.form-control-feedback.pointer > .bi-x-lg").exists()).to.be.true;
    });

    it("renders searchResults", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            store,
            localVue,
            propsData: props
        });
        wrapper.setData({
            searchResults: [
                new RoutingGeosearchResult(8, 52, "test1"),
                new RoutingGeosearchResult(8, 52, "test2")
            ]
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll("li").length).equal(2);
        expect(wrapper.findAll("li").at(0).element.innerHTML.trim()).equal("test1");
        expect(wrapper.findAll("li").at(1).element.innerHTML.trim()).equal("test2");
    });

    describe("tests isInputtextWgs84Coordinate", () => {
        it("should return [8, 52] for '8, 52'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({search: "8, 52"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).deep.to.equal([8, 52]);
        });

        it("should return [8.12, 52.34] for '8.12, 52.34'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({search: "8.12, 52.34"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).deep.to.equal([8.12, 52.34]);
        });

        it("should return false for '8,12 52,34'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({search: "8,12 52,34"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).to.be.false;
        });

        it("should return false for 'test'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({search: "test"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).to.be.false;
        });
    });

    describe("test component methods", () => {
        it("'selectSearchResult' should select search result on waypoint and emit 'searchResultSelected'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({
                searchResults: [
                    new RoutingGeosearchResult(8, 52, "test1"),
                    new RoutingGeosearchResult(8, 52, "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.selectSearchResult(new RoutingGeosearchResult(8, 52, "test1"));
            expect(props.waypoint.getDisplayName()).equal("test1");
            expect(wrapper.vm.search).equal("test1");
            expect(wrapper.vm.searchResults.length).equal(0);
            expect(wrapper.emitted().searchResultSelected.length).equal(1);
        });

        it("'selectWgs84Coordinate' should select search result on waypoint after wgs84 coordinates were entered and emit 'searchResultSelected'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.vm.transformCoordinatesWgs84ToLocalProjection = (coordinates) => coordinates;
            wrapper.setData({search: "8, 52"});
            await wrapper.vm.$nextTick();
            await wrapper.vm.selectWgs84Coordinate([8, 52]);
            expect(props.waypoint.getCoordinates()).deep.to.equal([8, 52]);
            expect(props.waypoint.getDisplayName()).equal("8, 52");
            expect(wrapper.vm.searchResults.length).equal(0);
            expect(wrapper.emitted().searchResultSelected.length).equal(1);
        });

        it("'resetInput' should reset 'searchResults' and 'search'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({
                search: "test",
                searchResults: [
                    new RoutingGeosearchResult(8, 52, "test1"),
                    new RoutingGeosearchResult(8, 52, "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.resetInput();
            expect(wrapper.vm.search).equal("");
            expect(wrapper.vm.searchResults.length).equal(0);
        });

        it("'resetInput' should reset 'searchResults' and 'search' to waypoint displayName", async () => {
            props.waypoint.setDisplayName("waypointnametest");
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                store,
                localVue,
                propsData: props
            });
            wrapper.setData({
                search: "test",
                searchResults: [
                    new RoutingGeosearchResult(8, 52, "test1"),
                    new RoutingGeosearchResult(8, 52, "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.resetInput();
            expect(wrapper.vm.search).equal("waypointnametest");
            expect(wrapper.vm.searchResults.length).equal(0);
        });
    });
});
