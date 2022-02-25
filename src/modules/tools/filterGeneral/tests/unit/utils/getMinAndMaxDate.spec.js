import {expect} from "chai";
import {
    getMinDate,
    getMaxDate
} from "../../../utils/getMinAndMaxDate.js";
import moment from "moment";

describe("src/modules/tools/filterGeneral/utils/getMinAndMaxDate.js", () => {
    describe("getMinDate", () => {
        it("should return the current date as valid date if no valid dates are given", () => {
            const format = "YYYY-MM-DD",
                result = getMinDate(undefined, undefined, format);

            expect(moment(result, format).isValid()).to.be.true;
        });
        it("should return the first param as date if no valid second param is given", () => {
            expect(getMinDate("2022-07-02", undefined, "YYYY-MM-DD")).to.equal("2022-07-02");
        });
        it("should return the second param as date if no valid first param is given", () => {
            expect(getMinDate(undefined, "2022-07-02", "YYYY-MM-DD")).to.equal("2022-07-02");
        });
        it("should return the lesser param if both params are valid dates", () => {
            expect(getMinDate("2021-07-02", "2022-07-02", "YYYY-MM-DD")).to.equal("2021-07-02");
        });
    });
    describe("getMaxDate", () => {
        it("should return the current date as valid date if no valid dates are given", () => {
            const format = "YYYY-MM-DD",
                result = getMaxDate(undefined, undefined, format);

            expect(moment(result, format).isValid()).to.be.true;
        });
        it("should return the first param as date if no valid second param is given", () => {
            expect(getMaxDate("2022-07-02", undefined, "YYYY-MM-DD")).to.equal("2022-07-02");
        });
        it("should return the second param as date if no valid first param is given", () => {
            expect(getMaxDate(undefined, "2022-07-02", "YYYY-MM-DD")).to.equal("2022-07-02");
        });
        it("should return the greater param if both params are valid dates", () => {
            expect(getMaxDate("2021-07-02", "2022-07-02", "YYYY-MM-DD")).to.equal("2022-07-02");
        });
    });
});
