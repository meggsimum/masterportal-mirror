<script>
import {mapActions} from "vuex";
import {getCenter as getCenterExtent} from "ol/extent";
import {isWebLink} from "../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../utils/isEmailAddress.js";

export default {
    name: "ListItem",
    props: {
        identifier: {
            type: String,
            required: true
        },
        tableHeads: {
            type: Object,
            required: true
        },
        tableData: {
            type: Array,
            required: true
        },
        geometryName: {
            type: String,
            default: ""
        },
        onRowClickCallback: {
            type: Function,
            required: false,
            default: () => { /* noop */ }
        },
        maxZoom: {
            type: Number,
            required: false,
            default: 5
        },
        // generates a pagination if resultsPerPage>0 and tableData.length>resultsPerPage
        resultsPerPage: {
            type: Number,
            required: false,
            default: 0
        }
    },
    data: () => ({
        visiblePage: 0
    }),
    computed: {
        visibleTableData () {
            if (this.resultsPerPage <= 0 ||
                this.tableData.length < this.resultsPerPage) {
                return this.tableData;
            }

            return this.tableData.slice(
                this.resultsPerPage * this.visiblePage,
                this.resultsPerPage * (this.visiblePage + 1)
            );
        },
        pageCount () {
            return this.resultsPerPage > 0 && this.tableData.length > this.resultsPerPage
                ? Math.ceil(this.tableData.length / this.resultsPerPage)
                : 1;
        }
    },
    methods: {
        ...mapActions("MapMarker", ["placingPointMarker"]),
        /**
         * Executes row click effects.
         * @param {String[]} data arbitrary data; may be a feature for setCenter
         * @returns {void}
         */
        onRowClick (data) {
            // if a geometryName is given, the data resembles a zoomable feature
            if (this.geometryName) {
                this.setCenter(data);
            }
            this.onRowClickCallback(data);
        },
        /**
         * Takes the selected coordinates and centers the map to the new position.
         * @param {String[]} feature clicked feature to zoom to
         * @returns {void}
         */
        setCenter (feature) {
            const geometry = feature.getGeometry();

            this.placingPointMarker(getCenterExtent(geometry.getExtent()));
            Radio.trigger("Map", "zoomToExtent", geometry, {maxZoom: this.maxZoom});
        },
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        removeVerticalBar (value) {
            return typeof value === "string" ? value.replace("|", ", ") : "";
        },
        replaceBoolean (value) {
            if (typeof value === "string") {
                if (value === "true") {
                    return value.replace("true", i18next.t("common:share-components.list.replace.true"));
                }
                if (value === "No") {
                    return value.replace("No", i18next.t("common:share-components.list.replace.No"));
                }
            }
            return "";
        },
        setVisiblePage (index) {
            this.visiblePage = index;
        }
    }
};
</script>

<template>
    <div
        :id="`${identifier}-list`"
    >
        <table>
            <tr>
                <th
                    v-for="([key, title], i) of Object.entries(tableHeads)"
                    :key="key + title + i"
                >
                    <span>
                        {{ title }}
                    </span>
                </th>
            </tr>
            <tr
                v-for="(data, i) in visibleTableData"
                :key="data + i"
                @click="onRowClick(data)"
            >
                <td
                    v-for="([key, title], j) of Object.entries(tableHeads)"
                    :key="key + title + j"
                >
                    <template v-if="key === geometryName">
                        <button
                            type="button"
                            class="btn btn-lgv-grey col-md-12 col-sm-12"
                        >
                            {{ $t("common:share-components.list.zoomToResult") }}
                        </button>
                    </template>
                    <template v-else-if="isWebLink(data.values_[key])">
                        <a
                            :href="data.values_[key]"
                            target="_blank"
                        >{{ data.values_[key] }}</a>
                    </template>
                    <template v-else-if="isPhoneNumber(data.values_[key])">
                        <a :href="getPhoneNumberAsWebLink(data.values_[key])">{{ data.values_[key] }}</a>
                    </template>
                    <template v-else-if="isEmailAddress(data.values_[key])">
                        <a :href="`mailto:${data.values_[key]}`">{{ data.values_[key] }}</a>
                    </template>
                    <template v-else-if="data.values_[key] === 'true' || data.values_[key] === 'No'">
                        {{ replaceBoolean(data.values_[key]) }}
                    </template>
                    <template v-else>
                        {{ removeVerticalBar(data.values_[key]) }}
                    </template>
                </td>
            </tr>
        </table>
        <nav
            v-if="pageCount > 1"
            :aria-label="$t('common:share-components.list.pagination')"
        >
            <ul class="pagination">
                <li
                    v-for="(_, index) of Array.from({length: pageCount})"
                    :key="index"
                    class="page-item"
                    @click="setVisiblePage(index)"
                    @keyup.space.stop.prevent="setVisiblePage(index)"
                >
                    <a href="#">{{ index + 1 }}</a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
$table-borders: 1px solid #ddd;
$table-padding: 8px;

table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    table-layout: auto;

    td {
        border: $table-borders;
        padding: $table-padding;
        cursor: pointer;
        vertical-align: top;
    }

    th {
        border: $table-borders;
        padding: 12px $table-padding;
        text-align: left;
        background-color: $primary;
        color: $accent_contrast;
    }

    tr:nth-child(even) {
        background-color: $secondary;
    }
}
</style>
