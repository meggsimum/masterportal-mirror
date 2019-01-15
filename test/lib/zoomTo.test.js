import zoomTo, {zoomToSearchResult} from "../../src/lib/zoomTo";

describe("zoomTo.js", function () {
    describe("zoomTo", function () {
        it("forwards its parameters to View's fit function", function () {
            const fitMock = jest.fn(),
                geometry = {},
                params = {},
                map = {
                    getView: () => ({
                        fit: fitMock
                    })
                };

            zoomTo(map, geometry, params);

            expect(fitMock).toHaveBeenCalledWith(geometry, params);
        });

        it("does not require params", function () {
            const fitMock = jest.fn(),
                geometry = {},
                map = {
                    getView: () => ({
                        fit: fitMock
                    })
                };

            zoomTo(map, geometry);

            expect(fitMock).toHaveBeenCalledWith(geometry, expect.any(Object));
        });
    });

    describe("zoomToSearchResult", function () {
        it("transforms polygon search result and zooms to it", function () {
            const fitMock = jest.fn(),
                searchResult = {
                    geometry: {
                        type: "Polygon",
                        coordinates: [1, 2, 3, 4]
                    }
                },
                map = {
                    getView: () => ({
                        fit: fitMock
                    })
                };

            zoomToSearchResult(map, searchResult);

            expect(fitMock.mock.calls[0][0].getCoordinates()).toEqual([[[1, 2], [3, 4]]]);
        });

        it("transforms point search result and zooms to it", function () {
            const fitMock = jest.fn(),
                searchResult = {
                    geometry: {
                        type: "Point",
                        coordinates: [1, 2]
                    }
                },
                map = {
                    getView: () => ({
                        fit: fitMock
                    })
                };

            zoomToSearchResult(map, searchResult);

            expect(fitMock.mock.calls[0][0].getCoordinates()).toEqual([1, 2]);
        });
    });
});
