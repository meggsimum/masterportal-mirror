import ListView from "@modules/menu/mobile/listView.js";
import {expect} from "chai";

describe("menu/mobile/folder/view", function () {
    let fakeModel,
        FakeListView;

    before(function () {
        FakeListView = ListView.extend({
            initialize: function () {
                // dummy function
            },
            doRequestTreeType: function () {
                // dummy function
            },
            doAppendNodeView: function (nodeView) {
                // this function is a replacement for the function which inserts a rendered list item into DOM and is used
                // to check if something (-> check content) shall be added to DOM (-> the function was called).
                if (nodeView.render().$el.find(".checked-all-item").length === 1) {
                    this.setCheckboxWasFound();
                }
                this.setAppendWasCalled();
            },
            setCheckboxWasFound: function () {
                this.checkboxWasFound = true;
            },
            wasCheckboxFound: function () {
                return this.checkboxWasFound;
            },
            setAppendWasCalled: function () {
                this.appendWasCalled = true;
            },
            wasAppendCalled: function () {
                return this.appendWasCalled;
            },
            appendWasCalled: false,
            checkboxWasFound: false
        });

        fakeModel = {
            getIsVisibleInTree: function () {
                return this.isVisibleInTree;
            },

            setIsVisibleInTree: function (value) {
                this.isVisibleInTree = value;
            },

            getId: function () {
                return "getID";
            },

            isFolderSelectable: true,
            isVisibleInTree: true,
            isSecured: false,

            setIsFolderSelectable: function (value) {
                this.isFolderSelectable = value;
            },

            toJSON: function () {
                return {
                    "isFolderSelectable": this.isFolderSelectable,
                    "isSelected": false,
                    "isSecured": false,
                    "name": "testFolder",
                    "isExpanded": true,
                    "icon": "test"
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
            },

            get: function (value) {
                if (value === "onlyDesktop") {
                    return false;
                }
                if (value === "type") {
                    return "folder";
                }

                return "invalid";
            },

            getType: function () {
                return "folder";
            }
        };
    });

    describe("the \"SelectAll\" checkbox", function () {
        it("should be hidden if the folder-property \"isFolderSelectable\" is false", function () {
            const fakeListView = new FakeListView();

            fakeModel.setIsFolderSelectable(false);
            fakeListView.addViews([fakeModel]);

            expect(fakeListView.wasAppendCalled()).to.be.equal(false);
        });
        it("should be visible if the folder-property \"isFolderSelectable\" is true", function () {
            const fakeListView = new FakeListView();

            fakeModel.setIsFolderSelectable(true);
            fakeListView.addViews([fakeModel]);
            expect(fakeListView.wasAppendCalled()).to.be.equal(true);
        });
    });
});
