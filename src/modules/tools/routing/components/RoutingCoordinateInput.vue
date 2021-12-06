<script>
import {mapActions} from "vuex";
import {RoutingGeosearchResult} from "../utils/classes/routing-geosearch-result";

export default {
    name: "RoutingCoordinateInput",
    props: {
        waypoint: {
            type: Object,
            required: true
        },
        countWaypoints: {
            type: Number,
            required: true,
            default: 0
        }
    },
    data () {
        return {
            search: this.waypoint.getDisplayName()
                ? this.waypoint.getDisplayName()
                : "",
            awaitingSearch: false,
            searchResults: [],
            ignoreNextSearchChange: false,
            isFocused: false
        };
    },
    computed: {
        /**
         * Computed value for the waypoint display name to watch for changes
         * @returns {String} the display name for the waypoint
         */
        waypointDisplayName () {
            return this.waypoint.getDisplayName();
        }
    },
    watch: {
        /**
         * Resets the input text string and makes sure that no additional request is made if the waypoint display name changes
         * @param {String} val new display name
         * @return {void}
         */
        waypointDisplayName: function (val) {
            this.ignoreNextSearchChange = true;
            this.search = !val ? "" : val;
        },
        /**
         * Starts a request if no new input comes after a short delay.
         * @returns {void}
         */
        search: function () {
            if (this.ignoreNextSearchChange) {
                this.ignoreNextSearchChange = false;
                return;
            }
            if (!this.awaitingSearch) {
                setTimeout(async () => {
                    this.awaitingSearch = false;
                    const isWgs84Coordinate = this.isInputtextWgs84Coordinate(this.search);

                    if (isWgs84Coordinate) {
                        await this.selectWgs84Coordinate(isWgs84Coordinate);
                    }
                    else {
                        this.searchResults = await this.fetchCoordinatesByText({
                            search: this.search
                        });
                    }
                }, 1000);
            }
            this.awaitingSearch = true;
        }
    },
    methods: {
        ...mapActions("Tools/Routing", ["fetchCoordinatesByText", "transformCoordinatesWgs84ToLocalProjection"]),
        /**
         * Selects a result from the external service provider.
         * @param {RoutingGeosearchResult} searchResult which was selected by the user
         * @returns {void}
         */
        selectSearchResult (searchResult) {
            if (!(searchResult instanceof RoutingGeosearchResult)) {
                return;
            }
            this.waypoint.setFromGeosearchResult(searchResult);
            this.ignoreNextSearchChange = true;
            this.search = searchResult.getDisplayName();
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Passes the input wgs84 coordinate to the waypoint
         * @param {[Number, Number]} wgs84Coordinate which was entered in the input text
         * @returns {void}
         */
        async selectWgs84Coordinate (wgs84Coordinate) {
            this.waypoint.setCoordinates(await this.transformCoordinatesWgs84ToLocalProjection(wgs84Coordinate));
            this.waypoint.setDisplayName(this.search);
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Resets all input by the user and clears the search results.
         * @returns {void}
         */
        resetInput () {
            this.ignoreNextSearchChange = true;
            this.searchResults = [];
            if (this.waypoint.getDisplayName()) {
                this.search = this.waypoint.getDisplayName();
            }
            else {
                this.search = "";
            }
        },
        /**
         * Checks if the current input text string is in the lat, lng format
         * @returns {Boolean} true if current input text is in the lat, lng format in the wgs84 range
         */
        isInputtextWgs84Coordinate () {
            if (typeof this.search !== "string") {
                return false;
            }
            const [latString, lngString] = this.search.split(", "),
                lat = Number(latString),
                lng = Number(lngString);

            if (!latString || !lngString) {
                return false;
            }
            if (!isFinite(lat) || Math.abs(lat) > 90 || !isFinite(lng) || Math.abs(lng) > 180) {
                return false;
            }

            return [lat, lng];
        },
        /**
         * Creates placeholder text for the input field
         * @returns {String} placeholder text
         */
        getPlaceholder () {
            if (this.waypoint.index === 0) {
                return i18next.t("common:modules.tools.routing.startpoint");
            }
            else if (this.waypoint.index === this.countWaypoints - 1) {
                return i18next.t("common:modules.tools.routing.endpoint");
            }
            return i18next.t("common:modules.tools.routing.waypoint");
        }
    }
};
</script>

<template>
    <div class="form-group-sm mx-0 mb-4">
        <div
            v-if="isFocused"
            class="mx-6 helptext"
        >
            <span>{{ $t('common:modules.tools.routing.coordinateInputHelp') }}</span>
        </div>

        <div class="d-flex justify-content-between">
            <label
                :id="'routingCoordinateInput_' + waypoint.index"
                :for="'routingCoordinateInput_' + waypoint.index"
                class="col-md-11 col-sm-11 d-flex pr-0 pl-0"
            >
                <input
                    :id="'routingCoordinateInput_' + waypoint.index"
                    v-model="search"
                    type="text"
                    class="col-md-11 col-sm-11 form-control"
                    :placeholder="getPlaceholder()"
                    autocomplete="off"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                >
                <span
                    v-if="search.length > 0 && search !== waypointDisplayName"
                    class="bootstrap-icon form-control-feedback pointer"
                    @click="resetInput()"
                    @keydown.enter="resetInput()"
                >
                    <i class="bi-x-lg" />
                </span>
            </label>
            <div class="d-flex">
                <div class="d-flex flex-column justify-content-between">
                    <div class="h-50">
                        <span
                            v-show="waypoint.index !== 0"
                            class="pointer bootstrap-icon"
                            :title="$t('common:modules.tools.routing.moveWaypointUp')"
                            @click="$emit('moveWaypointUp')"
                            @keydown.enter="$emit('moveWaypointUp')"
                        >
                            <i class="bi-chevron-up" />
                        </span>
                    </div>
                    <div class="h-50">
                        <span
                            v-show="waypoint.index !== countWaypoints - 1"
                            class="pointer bootstrap-icon"
                            :title="$t('common:modules.tools.routing.moveWaypointDown')"
                            @click="$emit('moveWaypointDown')"
                            @keydown.enter="$emit('moveWaypointDown')"
                        >
                            <i class="bi-chevron-down" />
                        </span>
                    </div>
                </div>
                <span
                    class="selfAlignCenter pointer bootstrap-icon ml-4"
                    :title="$t('common:modules.tools.routing.deleteWaypoint')"
                    @click="$emit('removeWaypoint')"
                    @keydown.enter="$emit('removeWaypoint')"
                >
                    <i class="bi-x-lg" />
                </span>
            </div>
        </div>

        <ul
            v-show="searchResults.length > 0 && isFocused"
            class="dropdown-menu-search dropdown-menu-left"
        >
            <li
                v-for="(searchResult, index) of searchResults"
                :key="index"
                class="list-group-item"
                @mousedown="selectSearchResult(searchResult)"
            >
                {{ searchResult.displayName }}
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.justify-content-between {
  justify-content: space-between;
}
.selfAlignCenter {
  display: flex;
  flex-direction: column;
  align-self: center;
}
.pointer {
  cursor: pointer;
}
.pl-0 {
  padding-left: 0;
}
.pr-0 {
    padding-right :0;
}
.h-50 {
  height: 50%;
}

label {
    width: 300px;
  margin-bottom: 0;
}
.form-group {
    position: relative;
}
.ml-4 {
    margin-left: 1rem;
}
.ml-6 {
    margin-left: 1.5rem;
}
.mx-6 {
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}
.mx-0 {
    margin-left: 0;
    margin-right: 0;
}
.mb-4 {
    margin-bottom: 1rem;
}
.bootstrap-icon.form-control-feedback {
    color: #777;
    pointer-events: all;
}

.helptext {
    max-width: calc(350px - 3rem);
}

.dropdown-menu-search {
    width: 300px;
    top: unset;
    left: unset;
}
</style>
