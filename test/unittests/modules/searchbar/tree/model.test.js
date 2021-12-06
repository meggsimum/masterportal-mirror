import Model from "@modules/searchbar/tree/model.js";
import {expect} from "chai";

describe("modules/searchbar/tree", function () {
    const config = {
        "searchBar": {
            "tree": {
                "minChars": 3
            },
            "zoomLevel": 9,
            "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
        }
    };
    let model = {};

    before(function () {
        model = new Model(config);
    });

    describe("getUniqeLayermodels", function () {
        const layerModels = [
            {
                id: 1,
                name: "aa",
                test: 11
            },
            {
                id: 1,
                name: "aa",
                test: 22
            },
            {
                id: 2,
                name: "bb",
                test: 33
            }
        ];

        it("Should be an empty array by empty array input", function () {
            expect(model.getUniqeLayermodels([])).to.be.an("array").that.is.empty;
        });
        it("Should be an empty array by undefined input", function () {
            expect(model.getUniqeLayermodels(undefined)).to.be.an("array").that.is.empty;
        });
        it("Should be an unique array that not includes the duplicates by name and id", function () {
            expect(model.getUniqeLayermodels(layerModels)).to.be.an("array").to.not.include(
                {
                    id: 1,
                    name: "aa",
                    test: 22
                }
            );
        });
    });

    describe("removeLayerInCaseOfMissingConfig", function () {
        const layerModels = [
            {
                name: "Spider-Man",
                typ: "WMS"
            },
            {
                name: "Thor",
                typ: "OBLIQUE"
            },
            {
                name: "Hulk",
                typ: "TILESET3D"
            },
            {
                name: "Iron Man",
                typ: "TERRAIN3D"
            },
            {
                name: "Captain America",
                typ: "WFS"
            }
        ];

        it("All layers should stay inside, because buttonOblique and button3d are true", function () {
            const controlsConfig = {
                buttonOblique: true,
                button3d: true
            };

            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.be.an("array");
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig).length).equals(5);
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).equals(layerModels);
        });

        it("Layers of type TERRAIN3D and TILESET3D are taken, because buttonOblique is true and button3d false", function () {
            const controlsConfig = {
                buttonOblique: true,
                button3d: false
            };

            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.be.an("array");
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig).length).equals(3);
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.deep.nested.include(
                {
                    name: "Spider-Man",
                    typ: "WMS"
                },
                {
                    name: "Thor",
                    typ: "OBLIQUE"
                },
                {
                    name: "Captain America",
                    typ: "WFS"
                }
            );
        });

        it("Layers of type OBLIQUE are taken, because buttonOblique is false and button3d true", function () {
            const controlsConfig = {
                buttonOblique: false,
                button3d: true
            };

            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.be.an("array");
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig).length).equals(4);
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.deep.nested.include(
                {
                    name: "Spider-Man",
                    typ: "WMS"
                },
                {
                    name: "Hulk",
                    typ: "TILESET3D"
                },
                {
                    name: "Iron Man",
                    typ: "TERRAIN3D"
                },
                {
                    name: "Captain America",
                    typ: "WFS"
                }
            );
        });

        it("Layers of type TERRAIN3D, TILESET3D and OBLIQUE are taken, because buttonOblique and button3d are true", function () {
            const controlsConfig = {
                buttonOblique: false,
                button3d: false
            };

            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.be.an("array");
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig).length).equals(2);
            expect(model.removeLayerInCaseOfMissingConfig(layerModels, controlsConfig)).to.deep.nested.include(
                {
                    name: "Spider-Man",
                    typ: "WMS"
                },
                {
                    name: "Captain America",
                    typ: "WFS"
                }
            );
        });
    });

    describe("getUniqeNodes", function () {
        const layerModels = [
            {
                id: 1,
                name: "aa",
                test: 11
            },
            {
                id: 2,
                name: "aa",
                test: 22
            },
            {
                id: 3,
                name: "cc",
                test: 33
            }
        ];

        it("Should be an empty array by empty array input", function () {
            expect(model.getUniqeNodes([])).to.be.an("array").that.is.empty;
        });
        it("Should be an empty array by undefined input", function () {
            expect(model.getUniqeNodes(undefined)).to.be.an("array").that.is.empty;
        });
        it("Should be an unique array that not includes the duplicates by name and id", function () {
            expect(model.getUniqeNodes(layerModels)).to.be.an("array").to.not.include(
                {
                    id: 2,
                    name: "aa",
                    test: 22
                }
            );
        });
    });

    describe("getLayerForSearch", function () {
        const layerModelsUniqe = [
            {
                id: 1,
                name: "aa",
                test: 11
            },
            {
                id: 2,
                name: "bb",
                test: 33
            }
        ];

        it("Should be an empty array by empty array input", function () {
            expect(model.getLayerForSearch([])).to.be.an("array").that.is.empty;
        });
        it("Should be an empty array by undefined input", function () {
            expect(model.getLayerForSearch(undefined)).to.be.an("array").that.is.empty;
        });
        it("Should be an unique array by id and name are the same properties", function () {
            expect(model.getLayerForSearch(layerModelsUniqe)).to.be.an("array").to.deep.include(
                {
                    name: "aa",
                    metaName: "aa",
                    type: i18next.t("common:modules.searchbar.type.topic"),
                    icon: "bi-list-ul",
                    id: 1
                },
                {
                    name: "bb",
                    metaName: "bb",
                    type: i18next.t("common:modules.searchbar.type.topic"),
                    icon: "bi-list-ul",
                    id: 2
                }
            );
        });
    });
});
