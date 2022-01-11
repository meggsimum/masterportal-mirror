import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../../store/actions/actionsSearchBarSearchInterfaces";

const {
    search
} = actions;

describe("src/modules/searchBar/store/actions/actionsSearchBarSearchInterfaces.spec.js", () => {
    describe("search", () => {
        it("search", done => {
            testAction(search, {}, {}, {}, [
            ], {}, done);
        });
    });
});
