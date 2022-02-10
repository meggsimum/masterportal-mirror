import {expect} from "chai";
import {arrayPerHour, calculateArithmeticMean} from "../../../utils/mathematicalOperations.js";

describe("src/modules/tools/gfi/components/themes/sensor/utils/mathematicalOperations.spec.js", () => {

    describe("arrayPerHour", function () {
        it("should return an empty array for undefined input", function () {
            expect(arrayPerHour(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(arrayPerHour(-1, [])).to.be.an("array").that.is.empty;
        });
        it("should return an array with data from input array for incorrect input", function () {
            expect(arrayPerHour(1, [{}])).to.be.an("array").that.is.empty;
        });
        it("should return an array with data for correct input", function () {
            const dataPerHour = [{
                0: 1,
                1: 0
            },
            {
                0: 1,
                1: 1
            },
            {
                0: 0,
                1: 0
            }];

            expect(arrayPerHour(1, dataPerHour)).to.be.an("array").that.includes(0, 1, 0);
        });
    });

    describe("calculateArithmeticMean", function () {
        it("should return an empty array for empty input", function () {
            expect(calculateArithmeticMean([])).to.be.an("array");
            expect(calculateArithmeticMean([]).length).equals(24);
        });
        it("should return an empty array for incorrect input", function () {
            expect(calculateArithmeticMean(["abc"])).to.be.an("array");
            expect(calculateArithmeticMean([]).length).equals(24);
        });
        it("should return an empty array for undefined input", function () {
            const dataPerHour = [{
                0: 1,
                1: 0
            },
            {
                0: 1,
                1: 1
            },
            {
                0: 0,
                1: 0
            }];

            expect(calculateArithmeticMean(dataPerHour)).to.be.an("array").to.have.deep.members([
                {
                    hour: 0,
                    result: 0.667
                },
                {
                    hour: 1,
                    result: 0.333
                },
                {
                    hour: 2,
                    result: 0
                },
                {
                    hour: 3,
                    result: 0
                },
                {
                    hour: 4,
                    result: 0
                },
                {
                    hour: 5,
                    result: 0
                },
                {
                    hour: 6,
                    result: 0
                },
                {
                    hour: 7,
                    result: 0
                },
                {
                    hour: 8,
                    result: 0
                },
                {
                    hour: 9,
                    result: 0
                },
                {
                    hour: 10,
                    result: 0
                },
                {
                    hour: 11,
                    result: 0
                },
                {
                    hour: 12,
                    result: 0
                },
                {
                    hour: 13,
                    result: 0
                },
                {
                    hour: 14,
                    result: 0
                },
                {
                    hour: 15,
                    result: 0
                },
                {
                    hour: 16,
                    result: 0
                },
                {
                    hour: 17,
                    result: 0
                },
                {
                    hour: 18,
                    result: 0
                },
                {
                    hour: 19,
                    result: 0
                },
                {
                    hour: 20,
                    result: 0
                },
                {
                    hour: 21,
                    result: 0
                },
                {
                    hour: 22,
                    result: 0
                },
                {
                    hour: 23,
                    result: 0
                }
            ]);
        });
    });
});
