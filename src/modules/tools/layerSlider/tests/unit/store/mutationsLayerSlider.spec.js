import {expect} from "chai";
import mutations from "../../../store/mutationsLayerSlider";

const {
    setActiveLayer,
    setProgressBarWidth,
    setWindowsInterval,
    resetActiveLayer
} = mutations;

describe("src/modules/tools/layerSlider/store/mutationslayerSlider.js", () => {
    describe("setActiveLayer", () => {
        it("setActiveLayer", () => {
            const state = {
                    currentProgressBarWidth: "width: 0%; margin-left: 0%",
                    progressBarWidth: 10,
                    activeLayer: {
                        layerId: "",
                        index: -1
                    }
                },
                layerId = {
                    layerId: "123",
                    title: "Pommes",
                    index: 1
                };

            setActiveLayer(state, layerId);

            expect(state.currentProgressBarWidth).to.equals("width: 10%; margin-left: 10%");
            expect(state.activeLayer).to.equals(layerId);
        });
    });
    describe("setProgressBarWidth", () => {
        it("setProgressBarWidth to 1/3 with three layers", () => {
            const state = {
                    progressBarWidth: 10
                },
                layerIds = [
                    {
                        layerId: "123",
                        title: "Pommes",
                        index: 0
                    },
                    {
                        layerId: "456",
                        title: "Ketchup",
                        index: 1
                    },
                    {
                        layerId: "789",
                        title: "Myonnaise",
                        index: 2
                    }
                ];

            setProgressBarWidth(state, layerIds);

            expect(state.progressBarWidth.toFixed(3)).to.equals("33.333");
        });
        it("setProgressBarWidth to 1/11 with eleven layers", () => {
            const state = {
                    progressBarWidth: 10
                },
                layerIds = [
                    {
                        layerId: "0",
                        index: 0
                    },
                    {
                        layerId: "1",
                        index: 1
                    },
                    {
                        layerId: "2",
                        index: 2
                    },
                    {
                        layerId: "3",
                        index: 3
                    },
                    {
                        layerId: "4",
                        index: 4
                    },
                    {
                        layerId: "5",
                        index: 5
                    },
                    {
                        layerId: "6",
                        index: 6
                    },
                    {
                        layerId: "7",
                        index: 7
                    },
                    {
                        layerId: "8",
                        index: 8
                    },
                    {
                        layerId: "9",
                        index: 9
                    },
                    {
                        layerId: "10",
                        index: 10
                    }
                ];

            setProgressBarWidth(state, layerIds);

            expect(state.progressBarWidth.toFixed(3)).to.equals("9.091");
        });
    });
    describe("setWindowsInterval", () => {
        it("set windowsInterval to null, if null is input", () => {
            const state = {
                timeInterval: 2000
            };

            setWindowsInterval(state, null);

            expect(state.windowsInterval).to.equals(null);
        });

        it("set a windowsInterval, if a function is input", () => {
            const state = {
                timeInterval: 2000
            };

            setWindowsInterval(state, () => ({}));

            expect(state.windowsInterval).to.not.equals(null);
        });
    });
    describe("resetActiveLayer", () => {
        it("resetActiveLayer", () => {
            const state = {
                currentProgressBarWidth: "width: 10%; margin-left: 10%",
                activeLayer: {
                    layerId: "123",
                    index: 1
                }
            };

            resetActiveLayer(state);

            expect(state.currentProgressBarWidth).to.equals("width: 0%; margin-left: 0%");
            expect(state.activeLayer).to.deep.equals({
                layerId: "",
                index: -1
            });
        });
    });
});
