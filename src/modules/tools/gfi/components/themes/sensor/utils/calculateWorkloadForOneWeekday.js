import * as moment from "moment";

/**
 * Calculates the workload for the current hour.
 * Time calculations in milliseconds.
 * @param  {String} actualState the status of the last observation.
 * @param  {Number} actualStateAsNumber The state as number 0 or 1.
 * @param  {String} actualTimeStep The start time.
 * @param  {String} nextTimeStep the end time.
 * @param  {String} targetResult The result to draw.
 * @param  {Object[]} [dataByActualTimeStep=[]] Within an hour.
 * @returns {Number} The workload.
 */
export function calculateOneHour (actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult, dataByActualTimeStep = []) {
    const endTime = moment(nextTimeStep).toDate().getTime();

    let betweenRes = "",
        timeDiff = 0,
        currentState = actualState,
        currentStateAsNumber = actualStateAsNumber,
        actualPhenomenonTime = moment(actualTimeStep).toDate().getTime();

    dataByActualTimeStep.forEach(data => {
        const state = data?.result || currentState;
        let phenomenonTime,
            res;

        if (state !== currentState) {
            phenomenonTime = data?.phenomenonTime ? moment(data.phenomenonTime).toDate().getTime() : "";

            res = (phenomenonTime - actualPhenomenonTime) * currentStateAsNumber;
            timeDiff = timeDiff + res;

            // update the current status and time
            actualPhenomenonTime = phenomenonTime;
            currentState = state;
            currentStateAsNumber = targetResult === currentState ? 1 : 0;
        }
    });

    // add last difference to next full hour
    betweenRes = (endTime - actualPhenomenonTime) * currentStateAsNumber;
    timeDiff = isNaN(betweenRes) ? timeDiff : timeDiff + betweenRes;

    // result in the unit hour, rounded to 3 decimal places
    return Math.round(timeDiff / 3600) / 1000;
}

/**
 * Filters out the objects of the current timestep.
 * @param  {Object[]} dayData Observations from one date.
 * @param  {String} actualTimeStep The start time.
 * @param  {String} nextTimeStep The end time.
 * @returns {Object[]} The data by actual time step.
 */
export function filterDataByActualTimeStep (dayData, actualTimeStep, nextTimeStep) {
    if (Array.isArray(dayData) === false) {
        return [];
    }

    return dayData.filter(data => {
        const dataToCheck = data?.phenomenonTime ? moment(data.phenomenonTime).format("YYYY-MM-DDTHH:mm:ss") : "";

        return dataToCheck >= actualTimeStep && dataToCheck < nextTimeStep;
    });
}

/**
 * Calculate the workload for one day.
 * @param  {Object} emptyDay Contains 24 objects.
 * @param  {Object[]} dayData Observations from one date.
 * @param  {String} targetResult Result to draw.
 * @returns {Object} The calculated workload for one day.
 */
export function calculateWorkloadforOneDay (emptyDay, dayData, targetResult) {
    const dataFromDay = dayData || [],
        startDate = dataFromDay.length > 0 && dataFromDay[0]?.phenomenonTime ? moment(dataFromDay[0].phenomenonTime).format("YYYY-MM-DD") : "",
        day = emptyDay || {};

    let actualState = dataFromDay.length > 0 && dataFromDay[0]?.result ? dataFromDay[0].result : "",
        actualStateAsNumber = targetResult === actualState ? 1 : 0;

    Object.keys(day).forEach(key => {
        const i = parseFloat(key, 10),
            actualTimeStep = moment(startDate).add(i, "hour").format("YYYY-MM-DDTHH:mm:ss"),
            nextTimeStep = moment(startDate).add(i + 1, "hour").format("YYYY-MM-DDTHH:mm:ss"),
            dataByActualTimeStep = filterDataByActualTimeStep(dataFromDay, actualTimeStep, nextTimeStep);

        // if the requested period is in the future
        if (moment(nextTimeStep).toDate().getTime() > moment().toDate().getTime()) {
            day[i] = undefined;
        }
        else if (dataByActualTimeStep.length === 0) {
            day[i] = actualStateAsNumber;
        }
        else {
            day[i] = calculateOneHour(actualState, actualStateAsNumber, actualTimeStep, nextTimeStep, targetResult, dataByActualTimeStep);
            actualState = dataByActualTimeStep[dataByActualTimeStep.length - 1].result;
            actualStateAsNumber = targetResult === actualState ? 1 : 0;
        }
    });

    return day;
}

/**
 * Creates an object with 24 pairs, which represents 24 hours for one day.
 * The values are by initialize 0.
 * @return {Object} The day object.
 */
export function createInitialDayPerHour () {
    const dayObj = {};

    for (let i = 0; i < 24; i++) {
        dayObj[i] = 0;
    }

    return dayObj;
}

/**
 * Calculates the workload for every day.
 * The workload is divided into 24 hours.
 * @param {String} targetResult Result to draw.
 * @param {Object} [processedHistoricalDataByWeekday=[]] Historical data sorted by weekday.
 * @returns {Object[]} The workload for one weekday.
 */
export function calculateWorkloadForOneWeekday (targetResult, processedHistoricalDataByWeekday = []) {
    const allData = [];

    processedHistoricalDataByWeekday.forEach(dayData => {
        const zeroTime = moment(moment(dayData[0].phenomenonTime).format("YYYY-MM-DD")).format("YYYY-MM-DDTHH:mm:ss"),
            firstTimeDayData = moment(dayData[0].phenomenonTime).format("YYYY-MM-DDTHH:mm:ss"),
            emptyDayObj = createInitialDayPerHour();
        let dayObj = {};

        if (firstTimeDayData !== zeroTime && Array.isArray(dayData)) {
            dayData.reverse();
        }

        dayObj = calculateWorkloadforOneDay(emptyDayObj, dayData, targetResult);
        allData.push(dayObj);
    });

    return allData;
}

export default {calculateOneHour, filterDataByActualTimeStep, calculateWorkloadforOneDay, createInitialDayPerHour, calculateWorkloadForOneWeekday};
