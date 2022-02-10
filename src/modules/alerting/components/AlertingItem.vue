<script>

import ModalItem from "../../../share-components/modals/components/ModalItem.vue";
import axios from "axios";
import {mapActions, mapGetters} from "vuex";

export default {
    name: "AlertingItem",

    components: {
        ModalItem
    },

    computed: {
        ...mapGetters("Alerting", [
            "displayedAlerts",
            "fetchBroadcastUrl",
            "localStorageDisplayedAlertsKey",
            "showTheModal",
            "sortedAlerts"
        ]),

        /**
         * Reads current URL and returns it without hash and without get params, always ending with slash.
         * This is needed to have a normalized URL tocompare with configured BroadcastConfig URLs;
         * see example file /portal/master/resources/broadcastedPortalAlerts.json
         * @returns {String} The normalized current browser URL
         */
        currentUrl: () => document.URL.replace(/#.*$/, "").replace(/\/*\?.*$/, "/"),

        /**
         * Console mapping to be able to debug in template.
         * @returns {void}
         */
        console: () => console
    },

    watch: {
        /**
         * Syncs localstorage with displayedAlerts prop.
         * @param {object} newDisplayedAlerts newly changed displayedAlerts object
         * @returns {void}
         */
        displayedAlerts (newDisplayedAlerts) {
            // Local storage is synced with this.displayedAlerts
            localStorage[this.localStorageDisplayedAlertsKey] = JSON.stringify(newDisplayedAlerts);
        }
    },

    /**
     * Created hook: Creates event listener for legacy Radio calls (to be removed seometime).
     * @returns {void}
     */
    created () {
        Backbone.Events.listenTo(Radio.channel("Alert"), {
            "alert": newAlert => {
                this.addSingleAlert(newAlert);
            }
        });
    },

    /**
     * Mounted hook: Initially sets up localstorage and then fetches BroadcastConfig.
     * @returns {void}
     */
    mounted () {
        let initialDisplayedAlerts;

        this.initialize();
        if (localStorage[this.localStorageDisplayedAlertsKey] !== undefined) {
            try {
                initialDisplayedAlerts = JSON.parse(localStorage[this.localStorageDisplayedAlertsKey]);

                this.setDisplayedAlerts(initialDisplayedAlerts);
            }
            catch (e) {
                localStorage[this.localStorageDisplayedAlertsKey] = JSON.stringify({});
            }
        }
        else {
            this.setDisplayedAlerts({});
        }

        if (this.fetchBroadcastUrl !== undefined && this.fetchBroadcastUrl !== false) {
            this.fetchBroadcast(this.fetchBroadcastUrl);
        }
    },

    methods: {
        ...mapActions("Alerting", [
            "addSingleAlert",
            "alertHasBeenRead",
            "cleanup",
            "initialize",
            "setDisplayedAlerts"
        ]),

        /**
         * Do this after successfully fetching broadcastConfig:
         * Process configured data and add each resulting alert into the state.
         * @param {object} response received response object
         * @returns {void}
         */
        axiosCallback: function (response) {
            const data = response.data,
                collectedAlerts = [];

            let collectedAlertIds = [];

            if (data.alerts === undefined || typeof data.alerts !== "object") {
                return;
            }

            if (Array.isArray(data.globalAlerts)) {
                collectedAlertIds = [...collectedAlertIds, ...data.globalAlerts];
            }

            if (data.restrictedAlerts !== undefined && typeof data.restrictedAlerts === "object") {
                Object.keys(data.restrictedAlerts).forEach(restrictedAlertUrl => {
                    if (restrictedAlertUrl.toLowerCase() === this.currentUrl.toLowerCase() && Array.isArray(data.restrictedAlerts[restrictedAlertUrl])) {
                        collectedAlertIds = [...collectedAlertIds, ...data.restrictedAlerts[restrictedAlertUrl]];
                    }
                });
            }

            for (const alertId in data.alerts) {
                if (collectedAlertIds.includes(alertId)) {
                    collectedAlerts.push(data.alerts[alertId]);
                }
            }

            collectedAlerts.forEach(singleAlert => {
                this.addSingleAlert(singleAlert);
            });
        },

        /**
         * Just a wrapper method for the XHR request for the sake of testing.
         * @param {string} fetchBroadcastUrl fetchBroadcastUrl
         * @returns {void}
         */
        fetchBroadcast: function (fetchBroadcastUrl) {
            axios.get(fetchBroadcastUrl).then(this.axiosCallback).catch(function (error) {
                console.warn(error);
            });
        },

        /**
         * When closing the modal, update all alerts' have-been-read states.
         * @returns {void}
         */
        onModalHid: function () {
            this.cleanup();
        },

        /**
         * Update a single alert's has-been-read state.
         * @param {string} hash hash
         * @returns {void}
         */
        markAsRead: function (hash) {
            this.alertHasBeenRead(hash);
        }
    }
};
</script>

<template>
    <div>
        <ModalItem
            :show-modal="showTheModal"
            @modalHid="onModalHid"
        >
            <div
                v-for="(alertCategory, categoryIndex) in sortedAlerts"
                :key="alertCategory.category"
                class="alertCategoryContainer"
                :class="{ last: categoryIndex === sortedAlerts.length-1 }"
            >
                <h3>
                    {{ $t(alertCategory.category) }}
                </h3>

                <div
                    v-for="(singleAlert, singleAlertIndex) in alertCategory.content"
                    :key="singleAlert.hash"
                    class="singleAlertWrapper"
                    :class="singleAlert.displayClass"
                >
                    <div
                        class="singleAlertContainer"
                        :class="{
                            singleAlertIsImportant: singleAlert.mustBeConfirmed,
                            last: singleAlertIndex === alertCategory.content.length-1
                        }"
                    >
                        <div
                            class="singleAlertMessage"
                            v-html="singleAlert.content"
                        />

                        <p
                            v-if="singleAlert.mustBeConfirmed"
                            class="confirm"
                        >
                            <a
                                @click="markAsRead(singleAlert.hash)"
                                @keydown.enter="markAsRead(singleAlert.hash)"
                            >
                                {{ $t(singleAlert.confirmText) }}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </ModalItem>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    div.alertCategoryContainer {
        margin-bottom:24px;

        &.last {
            margin-bottom:12px;
        }

        h3 {
            border:none;
            color: $secondary_contrast;
            font-size:14px;
            font-weight:bold;
            letter-spacing:initial;
            line-height:18px;
            margin:0 0 8px 0;
            padding:0;
        }

        /*
            This is only for now. Because there havent been defined any styles yet.
            Negative margin may be bad in the long run.
        */
        div.singleAlertWrapper {
            &.error {
                margin-left:-24px;
                border-left: 4px solid rgba(255, 0, 0, 0.9);
                padding-left: 21px;
            }
            &.warning {
                margin-left:-24px;
                border-left: 4px solid rgba(255, 125, 0, 0.7);
                padding-left: 21px;
            }
        }

        div.singleAlertContainer {
            border-bottom:1px dotted #CCCCCC;
            color:$secondary_contrast;
            font-size:12px;
            margin-bottom:12px;
            padding-bottom:12px;

            &.singleAlertIsImportant p {
                color:#EE7777;

                &.confirm a {
                    color:$secondary_contrast;
                    cursor:pointer;
                    text-decoration:underline;

                    &:hover {
                        text-decoration:none;
                    }
                }
            }

            &.last {
                border-bottom:none;
                padding-bottom:0;
            }
        }
    }
</style>
