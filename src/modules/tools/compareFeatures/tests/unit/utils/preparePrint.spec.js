import {expect} from "chai";
import {prettyValue} from "../../../utils/preparePrint.js";

before(() => {
    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("src/modules/tools/compareFeatures/utils/preparePrint.js", () => {
    describe("prettyValue", () => {
        it("should return - for undefined input", () => {
            expect(prettyValue(undefined)).to.equals("-");
        });

        it("should return a value in which the | have been replaced by \n", () => {
            const abc = "a|b|c";

            expect(prettyValue(abc)).to.be.a("string");
            expect(prettyValue(abc)).to.equals("a\nb\nc");
        });
        it("should return the input value if no | exists", () => {
            const abc = "abc";

            expect(prettyValue(abc)).to.be.a("string");
            expect(prettyValue(abc)).to.equals(abc);
        });
        it("should return the translation for 'true'", () => {
            const abc = "true";

            expect(prettyValue(abc)).to.be.a("string");
            expect(prettyValue(abc)).to.equals("modules.tools.compareFeatures.trueFalse.true");
        });
        it("should return the translation for 'false'", () => {
            const abc = "false";

            expect(prettyValue(abc)).to.be.a("string");
            expect(prettyValue(abc)).to.equals("modules.tools.compareFeatures.trueFalse.false");
        });
        it("should return the translation for 'no'", () => {
            const abc = "no";

            expect(prettyValue(abc)).to.be.a("string");
            expect(prettyValue(abc)).to.equals("modules.tools.compareFeatures.trueFalse.false");
        });
    });
});
