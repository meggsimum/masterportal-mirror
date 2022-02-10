/**
 * Register for paging and autorefresh intervals.
 * We use the filterId to identify paging and autorefresh intervals to start and stop them.
 * @class
 */
export default class IntervalRegister {
    /**
     * @constructor
     * @param {Object} pagingIntv the paging interval
     * @param {Object} autoRefreshIntv autorefresh intervals
     */
    constructor (pagingIntv = {}, autoRefreshIntv = {}) {
        // make this instance a singleton
        if (IntervalRegister.instance instanceof IntervalRegister) {
            return IntervalRegister.instance;
        }
        IntervalRegister.instance = this;

        this.pagingIntv = pagingIntv;
        this.autoRefreshIntv = autoRefreshIntv;
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
     * Starts a autorefreshing interval and runs the handler once immediately.
     * @param {Number} filterId the id of the filter
     * @param {Function} handler the handler to call for every cycle
     * @param {Number} mseconds the milliseconds to wait before calling the next cycle
     * @returns {void}
     */
    startAutoRefreshing (filterId, handler, mseconds) {
        this.stopAutoRefreshing(filterId);
        if (typeof handler === "function") {
            this.autoRefreshIntv[filterId] = setInterval(handler, mseconds);
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
        Object.values(this.autoRefreshIntv).forEach(intv => {
            clearInterval(intv);
        });
        this.pagingIntv = {};
        this.autoRefreshIntv = {};
    }
    /**
     * Aborts all running intervals for the given filterId.
     * @post all intervals of this filter are stopped
     * @param {Number} filterId the id of the filter to stop
     * @returns {void}
     */
    abortFilter (filterId) {
        this.stopPagingInterval(filterId);
        this.stopAutoRefreshing(filterId);
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
     * Stops the autorefreshing interval.
     * @post the interval is stopped
     * @param {Number} filterId the id of the filter to stop
     * @returns {void}
     */
    stopAutoRefreshing (filterId) {
        if (typeof this.autoRefreshIntv[filterId] === "number") {
            clearInterval(this.autoRefreshIntv[filterId]);
        }
        this.autoRefreshIntv[filterId] = false;
    }
}
