import CustomTreeParser from "@modules/core/configLoader/parserCustomTree.js";
import {expect} from "chai";
import Util from "@modules/core/util.js";

describe("core/configLoader/parserCustomTree", function () {
    let testData, backgroundMapsNoChildren, backgroundMapsWithChildren;

    before(function () {
        new Util();
        testData = {
            "Fachdaten": {
                "Ordner": [
                    {
                        "Titel": "Denkmalschutz",
                        "isFolderSelectable": true
                    },
                    {
                        "Titel": "Hochwasserschutz",
                        "isFolderSelectable": false
                    },
                    {
                        "Titel": "Eisenbahnwesen / Personenbeförderung",
                        "Ordner": [
                            {
                                "Titel": "Hamburger Verkehrsverbund (HVV)"
                            }
                        ]
                    }
                ]
            }
        };
        backgroundMapsNoChildren = {"Ordner": [{
            "Titel": "Karten",
            "isFolderSelectable": false,
            "Layer": [{
                "name": "Luftbild",
                "id": ["452"],
                "visibility": true
            },

            {
                "name": "Stadtplan",
                "id": ["453"]
            }
            ]
        }]};
        backgroundMapsWithChildren = {
            "Ordner": [
                {
                    "Titel": "Karten 1:5000",
                    "Layer": [
                        {
                            "id": "hamburg 1:5000",
                            "name": "Hamburg",
                            "children": [
                                {
                                    "id": "13716"
                                },
                                {
                                    "id": "720"
                                },
                                {
                                    "id": "13714"
                                }
                            ]
                        },
                        {
                            "name": "Stadtplan",
                            "id": "453"
                        },
                        {
                            "name": "Luftbild",
                            "id": "452",
                            "visibility": true
                        }
                    ]
                }
            ]};
    });

    // Create a model and parse the test data. Take care that the model is clean (empty) before parsing the data.
    /**
     *
     * get the custome model
     * @param {array} options - the model options
     * @returns {object} the model
     */
    function getCustomModel (options) {
        const model = new CustomTreeParser(options);

        model.setItemList([]);
        model.parseTree(testData.Fachdaten);
        return model;
    }

    /**
     *
     * get the custome model
     * @param {array} options - the model options
     * @returns {object} the model
     */
    function getCustomBackgroundMapModel (options = {backgroundMapsWithChildren: false}) {
        const model = new CustomTreeParser(options),
            testConfig = {};

        model.getRawLayerList = function () {
            return [
                {
                    "name": "Luftbild",
                    "id": "452"
                },
                {
                    "name": "Stadtplan",
                    "id": "453"
                },
                {
                    "name": "M2500 (farbig)",
                    "id": "13716"
                },
                {
                    "name": "M5000 (farbig)",
                    "id": "720"
                },
                {
                    "name": "M10000 (farbig)",
                    "id": "13714"
                }
            ];

        };

        if (options.backgroundMapsWithChildren) {
            testConfig.Hintergrundkarten = backgroundMapsWithChildren;
        }
        else {
            testConfig.Hintergrundkarten = backgroundMapsNoChildren;
        }
        model.setItemList([]);
        model.parseTree(testConfig.Hintergrundkarten, "Baselayer", 0);
        return model;
    }

    describe("the \"select all\" checkbox", function () {
        it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be visible if item-isFolderSelectable is true and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Denkmalschutz"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be hidden if item-isFolderSelectable is false and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
        });
        it("should be false if item-isFolderSelectable is false and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Hochwasserschutz"}).isFolderSelectable).to.be.equal(false);
        });
        it("should be visible if item-isFolderSelectable is undefined and global-isFolderSelectable is true", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: true}).get("itemList"), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(true);
        });
        it("should be hidden if item-isFolderSelectable is undefined and global-isFolderSelectable is false", function () {
            expect(Radio.request("Util", "findWhereJs", getCustomModel({isFolderSelectable: false}).get("itemList"), {"name": "Hamburger Verkehrsverbund (HVV)"}).isFolderSelectable).to.be.equal(false);
        });
    });

    describe("the number of items (folders) within the test data", function () {
        it("should be four", function () {
            expect(getCustomModel({isFolderSelectable: true}).get("itemList").length).to.be.equal(4);
        });
    });

    describe("background maps in folder structure shall always be in background", function () {
        it("should be three with parentId baselayer or folderId", function () {
            let folder = null;
            const itemList = getCustomBackgroundMapModel().get("itemList");

            expect(itemList.length).to.be.equal(3);
            folder = itemList.filter(item => item.type === "folder")[0];
            expect(folder).not.to.be.null;
            itemList.forEach(item => {
                if (item.type === "folder") {
                    expect(item.parentId).to.be.equals("Baselayer");
                }
                else {
                    expect(item.parentId).to.be.equals(folder.id);
                    expect(item.isBaseLayer).to.be.equals(true);
                }

            });
        });
        it("backgroundmaps with children should have 'isBaseLayer' true", function () {
            let folder = null;
            const itemList = getCustomBackgroundMapModel({backgroundMapsWithChildren: true}).get("itemList");

            expect(itemList.length).to.be.equal(2);
            folder = itemList.filter(item => item.type === "folder")[0];
            expect(folder).not.to.be.null;
            itemList.forEach(item => {
                if (item.type === "folder") {
                    expect(item.parentId).to.be.equals("Baselayer");
                }
                else {
                    expect(item.parentId).to.be.equals(folder.id);
                    expect(item.isBaseLayer).to.be.equals(true);
                }
            });
        });
    });
});
