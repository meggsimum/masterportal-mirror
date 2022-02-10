import {expect} from "chai";
import {createZeroTimeObservation, addIndex, processHistoricalDataByWeekdays} from "../../../utils/processHistoricalDataByWeekdays.js";

describe("src/modules/tools/gfi/components/themes/sensor/utils/processHistoricalDataByWeekdays.js", () => {
    describe("createZeroTimeObservation", function () {
        it("should return a copy of input object with the phenomenonTime of 00:00:00 at the same date.", function () {
            const observation = {
                phenomenonTime: "2020-10-30T10:59:02",
                result: "available"
            };

            expect(createZeroTimeObservation(observation)).to.be.an("object");
            expect(createZeroTimeObservation(observation)).to.deep.include({
                phenomenonTime: "2020-10-30T00:00:00",
                result: "available"
            });
        });
    });

    describe("addIndex", function () {
        it("should return an empty array for undefined input", function () {
            expect(addIndex(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array for empty array input", function () {
            expect(addIndex([])).to.be.an("array").that.is.empty;
        });
        it("should return an array that is equal to input array for incorrect array input", function () {
            expect(addIndex(["test", "abc"])).to.be.an("array").that.includes("test", "abc");
        });
        it("should return array with index for correct array input", function () {
            const historicalData = [{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available"
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging"
                },
                {
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "available"
                }]
            }];

            expect(addIndex(historicalData)).to.be.an("array").to.have.deep.members([{
                Observations: [{
                    phenomenonTime: "2018-06-17T10:55:52",
                    result: "available",
                    index: 0
                }]
            },
            {
                Observations: [{
                    phenomenonTime: "2018-06-17T12:57:15",
                    result: "charging",
                    index: 0
                },
                {
                    phenomenonTime: "2018-06-17T12:59:15",
                    result: "available",
                    index: 1
                }]
            }]);
        });
    });

    describe("processHistoricalDataByWeekdays", function () {
        it("should return an array with seven empty arrays for undefined input", function () {
            expect(processHistoricalDataByWeekdays(undefined, undefined)).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven empty arrays for empty array and empty string input", function () {
            expect(processHistoricalDataByWeekdays([], "")).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven empty arrays for empty array and empty string input", function () {
            expect(processHistoricalDataByWeekdays(["test", 1111, "abcd"], "")).to.be.an("array").to.have.deep.members([
                [], [], [], [], [], [], []
            ]);
        });
        it("should return an array with seven arrays that contains divided data for correct data without lastDay input", function () {
            const historicalDataWithIndex = [{
                    Observations: [{
                        phenomenonTime: "2020-06-17T10:55:52",
                        result: "available",
                        index: 0
                    }]
                },
                {
                    Observations: [{
                        phenomenonTime: "2020-06-17T12:59:15",
                        result: "charging",
                        index: 0
                    },
                    {
                        phenomenonTime: "2020-06-17T12:57:15",
                        result: "available",
                        index: 1
                    },
                    {
                        phenomenonTime: "2020-06-15T10:40:00",
                        result: "charging",
                        index: 1
                    }]
                }],
                startDate = "2018-06-17";

            expect(processHistoricalDataByWeekdays(historicalDataWithIndex, startDate)).to.be.an("array");
            expect(processHistoricalDataByWeekdays(historicalDataWithIndex, startDate).length).equals(7);
            processHistoricalDataByWeekdays(historicalDataWithIndex, startDate)[0][0].forEach(value => {
                expect(value).to.have.property("phenomenonTime");
                expect(value).to.have.property("result");
            });
        });
    });
});
