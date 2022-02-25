import ViewTree from "@modules/menu/desktop/folder/viewTree.js";
import {expect} from "chai";

describe("menu/desktop/folder/viewTree", function () {
    let viewTree;

    before(function () {
        const fakeModel = {
            get: function (attrib) {
                if (attrib === "parentId") {
                    return null;
                }
                return true;
            },
            getIsVisibleInTree: function () {
                return true;
            },

            getId: function () {
                return "getID";
            },

            isFolderSelectable: false,
            isSecured: false,
            id: "123",
            parentId: "tree",

            setIsFolderSelectable: function (value) {
                this.isFolderSelectable = value;
            },

            toJSON: function () {
                return {
                    "isFolderSelectable": this.isFolderSelectable,
                    "isSelected": false,
                    "name": "testFolder",
                    "showAllTopicsText": "test",
                    "isSecured": false,
                    "id": "123",
                    "parentId": "tree"
                };
            },

            getParentId: function () {
                return "parentID";
            },

            getLevel: function () {
                return 3;
            },

            getIsExpanded: function () {
                return true;
            }
        };

        viewTree = new ViewTree({
            model: fakeModel
        });
        i18next.init({
            lng: "cimode",
            debug: false

        });
    });

    describe("the \"SelectAll\" checkbox", function () {
        it("should be hidden if the folder-property \"isFolderSelectable\" is false", function () {
            viewTree.model.setIsFolderSelectable(false);
            viewTree.render();
            expect(viewTree.$el.find(".selectall").length).to.be.equal(0);
        });
        it("should be visible if the folder-property \"isFolderSelectable\" is true", function () {
            viewTree.model.setIsFolderSelectable(true);
            viewTree.render();
            expect(viewTree.$el.find(".selectall").length).to.be.equal(1);
        });
    });
});
