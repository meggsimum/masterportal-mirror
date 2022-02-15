import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";

import ListItem from "../../../components/ListItem.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/share-components/list/components/ListItem.vue", () => {
    const olFeature = new Feature(),
        props = {
            identifier: "Spongebob",
            tableHeads: {
                x: "x",
                y: "y",
                z: "z"
            },
            tableData: [],
            geometryName: "qwertz"
        };
    let trigger,
        store;

    before(() => {
        olFeature.set("x", "Gary");
        olFeature.set("y", "Patrick");
        olFeature.set("z", "Thaddaeus");

        props.tableData.push(olFeature);
    });

    beforeEach(() => {
        trigger = sinon.spy();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                MapMarker: {
                    namespaced: true,
                    actions: {
                        placingPointMarker: sinon.stub()
                    }
                }
            }
        });

        sinon.stub(Radio, "trigger").callsFake(trigger);
    });

    it("should zoom to extent of a given feature", async () => {
        const wrapper = shallowMount(ListItem, {
                store,
                propsData: props,
                localVue
            }),
            feature = new Feature();

        feature.setGeometry(new Point([583805.011, 5923760.691]));
        wrapper.vm.setCenter(feature);

        expect(trigger.calledOnce).to.be.true;
        expect(trigger.firstCall.args).to.eql(["Map", "zoomToExtent", feature.getGeometry(), {maxZoom: 5}]);
    });
});
