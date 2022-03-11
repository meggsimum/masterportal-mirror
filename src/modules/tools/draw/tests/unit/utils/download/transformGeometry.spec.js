import {expect} from "chai";
import proj4 from "proj4";
import {transform, transformPoint} from "../../../../utils/download/transformGeometry";


describe("src/modules/tools/draw/utils/download/transformGeometry.js", () => {
    beforeEach(() => {
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    });
    describe("transform", function () {
        it("should transform line coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [
                [689800.1275079311, 5339513.679162612],
                [691403.501642109, 5339640.679094031],
                [691848.0014020792, 5340259.803759704]
            ];

            expect(transform("EPSG:25832", coords, false)).to.eql(
                [
                    [11.553402467145743, 48.1804863212112],
                    [11.57500753257633, 48.18114681249815],
                    [11.581260790324238, 48.18657730024906]
                ]
            );
        });
        it("should transform polygon coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [[
                [689546.127645091, 5338656.429625526],
                [693324.3756048371, 5339497.804171184],
                [691609.8765306666, 5335989.431065706],
                [689546.127645091, 5338656.429625526]
            ]];

            expect(transform("EPSG:25832", coords, true)).to.eql(
                [[
                    [11.549606597804212, 48.17285719239628],
                    [11.600757126539783, 48.17928117108303],
                    [11.57613610826325, 48.1482678593347],
                    [11.549606597804212, 48.17285719239628]
                ]]
            );
        });
    });
    describe("transformPoint", function () {
        it("should transform point coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [690054.1273707711, 5340593.1785796825];

            expect(transformPoint("EPSG:25832", coords)).to.eql([11.557298950390026, 48.19011285902384]);
        });
    });
});
