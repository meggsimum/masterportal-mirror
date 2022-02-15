import {expect} from "chai";
import {calculateOneHour, filterDataByActualTimeStep, calculateWorkloadforOneDay, createInitialDayPerHour, calculateWorkloadForOneWeekday} from "../../../utils/calculateWorkloadForOneWeekday.js";

describe("src/modules/tools/gfi/components/themes/sensor/utils/calculateWorkloadForOneWeekday.js", () => {

    describe("calculateOneHour", function () {
        it("should return number 0 for undefined input", function () {
            expect(calculateOneHour(undefined, undefined, undefined, undefined, undefined, undefined)).to.be.a("number").to.equal(0);
        });
        it("should return number 0 for empty input", function () {
            expect(calculateOneHour("", -1, "", "", "", [])).to.be.a("number").to.equal(0);
        });
        it("should return number 0.167 for a result change after 10 minutes input", function () {
            const dataByActualTimeStep = [{
                    phenomenonTime: "2018-06-21T01:10:00",
                    result: "available"
                }],
                actualState = "charging",
                actualStateAsNumber = 1,
                actualTimeStep = "2018-06-21T01:00:00",
                nextTimeStep = "2018-06-21T02:00:00",
                targetResult = "charging";

            expect(calculateOneHour(actualState, actualStateAsNumber,
                actualTimeStep, nextTimeStep, targetResult, dataByActualTimeStep)).to.be.a("number").to.equal(0.167);
        });
    });

    describe("filterDataByActualTimeStep", function () {
        it("should return an empty object for undefined input", function () {
            expect(filterDataByActualTimeStep(undefined, undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty object for empty input", function () {
            expect(filterDataByActualTimeStep([], "", "")).to.be.an("array").that.is.empty;
        });
        it("should return an empty object for incorrect input", function () {
            expect(filterDataByActualTimeStep([{test: "text"}], "123", "abc")).to.be.an("array").that.is.empty;
        });
        it("should return an array with objects between the timesteps for correct input", function () {
            const dayData = [{
                    phenomenonTime: "2018-06-21T00:00:00",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-21T01:10:00",
                    result: "available"
                }],
                actualTimeStep = "2018-06-21T01:00:00",
                nextTimeStep = "2018-06-21T02:00:00";

            expect(filterDataByActualTimeStep(dayData, actualTimeStep, nextTimeStep)).to.have.deep.members([{
                phenomenonTime: "2018-06-21T01:10:00",
                result: "available"
            }]);
        });
    });

    describe("calculateWorkloadforOneDay", function () {
        it("should return an empty object for undefined input", function () {
            expect(calculateWorkloadforOneDay(undefined, undefined, undefined)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object for empty input", function () {
            expect(calculateWorkloadforOneDay({}, [], "")).to.be.an("object").that.is.empty;
        });
        it("should return object that includes data from input object for incorrect input", function () {
            const emptyDayObj = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                    8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
                    16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0},
                dayData = [{
                    phenomenonTime: "2018-06-20T00:00:00",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-20T22:00:00",
                    result: "charging"
                }],
                targetResult = "charging";

            expect(calculateWorkloadforOneDay(emptyDayObj, dayData, targetResult)).to.be.an("object").that.includes({
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 1, 23: 1
            });
        });
    });

    describe("createInitialDayPerHour", function () {
        it("should return an object with 24 keys from 0 to 23 and values are 0", function () {
            expect(createInitialDayPerHour()).to.be.an("object");
            expect(createInitialDayPerHour()).that.includes({0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
                16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0});
        });
    });

    describe("calculateWorkloadPerDayPerHour", function () {
        it("should return an empty array for undefined input", function () {
            expect(calculateWorkloadForOneWeekday(undefined, undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty input", function () {
            expect(calculateWorkloadForOneWeekday("", [])).to.be.an("array").that.is.empty;
        });
        it("should return an array with 24 objects representing the workload array for correct input", function () {
            const divideDataByWeekday = [[{
                    phenomenonTime: "2018-06-07T00:00:00",
                    result: "available"
                },
                {
                    phenomenonTime: "2018-06-07T23:00:00",
                    result: "charging"
                }]],
                targetResult = "charging";

            expect(calculateWorkloadForOneWeekday(targetResult, divideDataByWeekday)).to.be.an("array").to.have.deep.members([{
                0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
                8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0,
                15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 1
            }]);
        });
    });
});
