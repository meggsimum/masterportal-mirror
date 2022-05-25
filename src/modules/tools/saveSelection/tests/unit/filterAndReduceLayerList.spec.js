import {expect} from "chai";
import sinon from "sinon";
import filterAndReduceLayerList from "../../utils/filterAndReduceLayerList.js";

describe("src/modules/tools/saveSelection/utils/filterAndReduceLayerList.js", () => {
    describe("filterAndReduceLayerList", () => {
        const layer1 = {
                id: "1",
                get: (key) => {
                    if (key === "id") {
                        return "1";
                    }
                    if (key === "isExternal") {
                        return false;
                    }
                    return true;
                }
            },
            layer2 = {
                id: "2",
                get: (key) => {
                    if (key === "id") {
                        return "2";
                    }
                    if (key === "isExternal") {
                        return false;
                    }
                    return true;
                }
            };

        afterEach(() => {
            sinon.restore();
        });

        it("shall not fail with no arguments", () => {
            const result = filterAndReduceLayerList();

            expect(result).to.be.an("array").and.to.be.empty;
        });
        it("shall return reduced layers", () => {
            const layerlist = [
                layer1, layer2
            ];
            let result = null;

            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (channel === "Util" && topic === "sortBy") {
                    return layerlist.reverse();
                }
                return null;
            });
            result = filterAndReduceLayerList(layerlist);

            expect(result).to.be.an("array").to.have.lengthOf(2);
            expect(result[0]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "2"
            });
            expect(result[1]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "1"
            });
        });
        it("shall return reduced layers without layer defined in featureViaURL", () => {
            global.Config = {};
            Config.featureViaURL = {};
            Config.featureViaURL.layers = [{id: "1"}];

            const layerlist = [
                layer1, layer2
            ];
            let result = null;

            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (channel === "Util" && topic === "sortBy") {
                    return layerlist.reverse();
                }
                return null;
            });
            result = filterAndReduceLayerList(layerlist);

            expect(result).to.be.an("array").to.have.lengthOf(1);
            expect(result[0]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "2"
            });
        });

    });
});
