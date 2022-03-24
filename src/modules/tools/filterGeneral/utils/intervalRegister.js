/**
 * Register for paging intervals.
 * We use the filterId to identify paging intervals to start and stop them.
 * @class
 */
export default class IntervalRegister {
    /**
     * @constructor
     * @param {Object} pagingIntv the paging interval
     */
    constructor (pagingIntv = {}) {
        // make this instance a singleton
        if (IntervalRegister.instance instanceof IntervalRegister) {
            return IntervalRegister.instance;
        }
        IntervalRegister.instance = this;

        this.pagingIntv = pagingIntv;
    }

    /**
     * Starts a paging interval and runs the handler once immediately.
     * @param {Number} filterId the id of the filter
     * @param {Function} handler the handler to call for every cycle
     * @param {Number} mseconds the milliseconds to wait before calling the next cycle
     * @returns {void}
     */
    startPagingInterval (filterId, handler, mseconds) {
        this.stopPagingInterval(filterId);
        if (typeof handler === "function") {
            this.pagingIntv[filterId] = setInterval(handler, mseconds);
            handler();
        }
    }

    /**
     * Aborts all running intervals.
     * @post all intervals are stopped
     * @returns {void}
     */
    abortAll () {
        Object.values(this.pagingIntv).forEach(intv => {
            clearInterval(intv);
        });
        this.pagingIntv = {};
    }
    /**
     * Aborts all running intervals for the given filterId.
     * @post all intervals of this filter are stopped
     * @param {Number} filterId the id of the filter to stop
     * @returns {void}
     */
    abortFilter (filterId) {
        this.stopPagingInterval(filterId);
    }
    /**
     * Stops the paging interval.
     * @post the interval is stopped
     * @param {Number} filterId the id of the filter to stop
     * @returns {void}
     */
    stopPagingInterval (filterId) {
        if (typeof this.pagingIntv[filterId] === "number") {
            clearInterval(this.pagingIntv[filterId]);
        }
        this.pagingIntv[filterId] = false;
    }
    /**
     * Checks if a interval is running.
     * @param {Number} filterId the id of the filter to stop
     * @returns {Boolean} true if the interval of this filterId is running
     */
    isPagingIntervalRunning (filterId) {
        return typeof this.pagingIntv[filterId] === "number";
    }
}
