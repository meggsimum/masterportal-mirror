<script>
import beautifyKey from "../../../../../../../utils/beautifyKey.js";
import {isWebLink} from "../../../../../../../utils/urlHelper.js";
import {translateKeyWithPlausibilityCheck} from "../../../../../../../utils/translateKeyWithPlausibilityCheck.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../../../../utils/isEmailAddress.js";
import CompareFeatureIcon from "../../../favoriteIcons/components/CompareFeatureIcon.vue";
import DefaultThemeSensorChart from "./DefaultThemeSensorChart.vue";
import {getPropertiesWithFullKeys} from "../../../../utils/getPropertiesWithFullKeys.js";

export default {
    name: "DefaultTheme",
    components: {
        CompareFeatureIcon,
        DefaultThemeSensorChart
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            imageLinks: ["bildlink", "link_bild", "Bild", "bild"],
            importedComponents: [],
            showFavoriteIcons: true,
            maxWidth: "600px",
            beautifyKeysParam: true,
            showObjectKeysParam: false
        };
    },
    computed: {
        /**
         * Returns the first value found from the feature properties based on the imageLinks.
         * @return {String} The attribute with image link.
         */
        imageAttribute: function () {
            const properties = this.feature.getProperties();

            if (properties === null || typeof properties !== "object" || !Array.isArray(this.imageLinks)) {
                return undefined;
            }
            for (const key of this.imageLinks) {
                if (Object.prototype.hasOwnProperty.call(properties, key)) {
                    return properties[key];
                }
            }
            return undefined;
        },

        /**
         * Returns the mimeType of the gfi feature.
         * @returns {String} The mimeType.
         */
        mimeType: function () {
            return this.feature.getMimeType();
        }
    },
    watch: {
        feature () {
            this.$nextTick(() => {
                this.addTextHtmlContentToIframe();
                this.setMaxWidth(this.feature.getTheme()?.params);
                this.initParams(this.feature.getTheme()?.params);
            });
        }
    },
    created () {
        this.showFavoriteIcons = this.feature.getTheme()?.params?.showFavoriteIcons ?
            this.feature.getTheme().params.showFavoriteIcons : this.showFavoriteIcons;

        this.replacesConfiguredImageLinks();
        this.setImportedComponents();
    },
    mounted () {
        this.$nextTick(() => {
            this.addTextHtmlContentToIframe();
            this.setMaxWidth(this.feature.getTheme()?.params);
            this.initParams(this.feature.getTheme()?.params);
        });
    },
    methods: {
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        translateKeyWithPlausibilityCheck,

        /**
         * checks if given feature has a function getMappedProperties
         * @param {Object} feature the current feature to check
         * @return {Boolean} returns true if given feature has a function getMappedProperties
         */
        mappedPropertiesExists (feature) {
            return typeof feature === "object" && feature !== null && typeof feature.getMappedProperties === "function";
        },

        /**
         * checks if the given feature has one or more mapped properties
         * @param {Object} feature the current feature to check
         * @returns {Boolean} returns true if feature has mapped properties
         */
        hasMappedProperties (feature) {
            return Object.keys(feature.getMappedProperties()).length !== 0;
        },

        /**
         * returns the mapped properties of the given feature or parses the properites through getPropertiesWithFullKeys if the component flag showObjectKeysParam is set
         * @param {Object} feature the current feature
         * @param {Boolean} [showObjectKeysParam=false] the switch to activate getPropertiesWithFullKeys
         * @returns {Object} returns mapped properties
         */
        getMappedPropertiesOfFeature (feature, showObjectKeysParam = false) {
            if (showObjectKeysParam === true) {
                const properties = getPropertiesWithFullKeys(feature.getMappedProperties());

                return properties !== false ? properties : {};
            }
            return feature.getMappedProperties();
        },

        /**
         * sets params from gfiTheme params
         * @param {Object} params the params to set
         * @returns {void}
         */
        initParams (params) {
            if (typeof params !== "object" || params === null) {
                return;
            }
            this.beautifyKeysParam = params?.beautifyKeys;
            this.showObjectKeysParam = params?.showObjectKeys;
        },

        /**
         * checks if the given value is an object for rendering a linechart diagram
         * @param {*} value anything to check
         * @returns {Boolean} true if this can be converted to a linechart, false if not
         */
        isSensorChart (value) {
            return typeof value === "object" && value !== null
                && (
                    value.type === "linechart"
                    || value.type === "barchart"
                    || value.type === "cakechart"
                )
                && typeof value.query === "string"
                && typeof value.staObject === "object" && value.staObject !== null
                && typeof value.staObject["@iot.selfLink"] === "string";
        },

        /**
         * Sets the imported components to importedComponents.
         * @returns {void}
         */
        setImportedComponents: function () {
            Object.keys(this.$options.components).forEach(componentName => {
                if (componentName !== "DefaultTheme") {
                    this.importedComponents.push(this.$options.components[componentName]);
                }
            });
        },

        /**
         * Replaces  the configured imageLinks from the gfiTheme.params to the imageLinks.
         * @returns {void}
         */
        replacesConfiguredImageLinks: function () {
            const imageLinksAttribute = this.feature.getTheme()?.params?.imageLinks;

            if (Array.isArray(imageLinksAttribute)) {
                this.imageLinks = imageLinksAttribute;
            }
            else if (typeof imageLinksAttribute === "string") {
                this.imageLinks = [imageLinksAttribute];
            }
        },

        /**
         * Adds the text/html content to the iframe.
         * The onLoad event of the iframe starts with the execution of close().
         * @returns {void}
         */
        addTextHtmlContentToIframe: function () {
            const iframe = document.getElementsByClassName("gfi-iFrame")[0];

            if (this.mimeType === "text/html" && iframe) {
                this.setIframeSize(iframe, this.feature.getTheme()?.params);
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(this.feature.getDocument());
                iframe.contentWindow.document.close();
            }
        },

        /**
         * Sets the size of the given iframe.
         * The iframe size can be overwritten in the config.json at the layer.
         * @param {Object} iframe The iframe.
         * @param {Object} params The gfi parameters.
         * @returns {void}
         */
        setIframeSize: function (iframe, params) {
            document.getElementsByClassName("gfi-theme-iframe")[0].style.maxWidth = "";
            iframe.style.width = params?.iframe?.width;
            iframe.style.height = params?.iframe?.height;
        },

        /**
         * Sets the max-width of the default gfiTheme content.
         * @param {Object} params The gfi parameters.
         * @returns {void}
         */
        setMaxWidth: function (params) {
            if (this.mimeType !== "text/html") {
                const gfiThemeContainer = document.getElementsByClassName("gfi-theme-images")[0];

                if (typeof gfiThemeContainer?.style !== "object" || gfiThemeContainer?.style === null) {
                    return;
                }

                if (params?.maxWidth) {
                    gfiThemeContainer.style.maxWidth = params?.maxWidth;
                }
                else {
                    gfiThemeContainer.style.maxWidth = this.maxWidth;
                }
            }
        }
    }
};
</script>

<template>
    <div :class="mimeType === 'text/html' ? 'gfi-theme-iframe' : 'gfi-theme-images'">
        <div
            v-if="showFavoriteIcons && mimeType !== 'text/html'"
            class="favorite-icon-container"
        >
            <template v-for="component in importedComponents">
                <component
                    :is="component"
                    :key="'favorite-' + component.name"
                    :feature="feature"
                />
            </template>
        </div>
        <div v-if="mimeType !== 'text/html'">
            <a
                v-if="imageAttribute"
                :href="imageAttribute"
                target="_blank"
            >
                <img
                    class="gfi-theme-images-image"
                    :alt="$t('modules.tools.gfi.themes.default.imgAlt')"
                    :src="imageAttribute"
                >
            </a>
        </div>
        <table
            v-if="mimeType !== 'text/html'"
            class="table table-hover"
        >
            <tbody v-if="mappedPropertiesExists(feature)">
                <tr v-if="!hasMappedProperties(feature)">
                    <td class="bold">
                        {{ $t("modules.tools.gfi.themes.default.noAttributeAvailable") }}
                    </td>
                </tr>
                <tr
                    v-for="(value, key) in getMappedPropertiesOfFeature(feature, showObjectKeysParam)"
                    v-else
                    :key="key"
                >
                    <td
                        v-if="!isSensorChart(value)"
                        class="bold firstCol"
                    >
                        <span v-if="beautifyKeysParam">
                            {{ beautifyKey(translateKeyWithPlausibilityCheck(key, v => $t(v))) }}
                        </span>
                        <span v-else>
                            {{ key }}
                        </span>
                    </td>
                    <td v-if="isWebLink(value)">
                        <a
                            :href="value"
                            target="_blank"
                        >Link</a>
                    </td>
                    <td v-else-if="isPhoneNumber(value)">
                        <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                    </td>
                    <td v-else-if="isEmailAddress(value)">
                        <a :href="`mailto:${value}`">{{ value }}</a>
                    </td>
                    <td
                        v-else-if="Array.isArray(value)"
                        v-html="value.join('<br>')"
                    />
                    <td
                        v-else-if="typeof value === 'string' && value.includes('<br>')"
                        v-html="value"
                    />
                    <td
                        v-else-if="isSensorChart(value)"
                        colspan="2"
                    >
                        <DefaultThemeSensorChart
                            :type="value.type"
                            :label="value.label"
                            :query="value.query"
                            :format="value.format"
                            :sta-object="value.staObject"
                            :options="value.options"
                            :chart-options="value.chartOptions"
                            :download="value.download"
                        />
                    </td>
                    <td v-else>
                        {{ value }}
                    </td>
                </tr>
            </tbody>
        </table>
        <iframe
            v-if="mimeType === 'text/html'"
            class="gfi-iFrame"
            title="gfi-iFrame"
        />
    </div>
</template>


<style lang="scss" scoped>
@import "~variables";

.table > tbody > tr > td {
    padding: 5px 8px;
    font-size: 12px;
    &.bold{
        font-family: $font_family_accent;
    }
}
.gfi-iFrame {
    height: 450px;
    resize: both;
}
@media (min-width: 768px) {
    .gfi-iFrame {
        width: 450px;
    }
}
@media (max-width: 767px) {
    .gfi-iFrame {
        width: 100%;
    }
}
.gfi-theme-iframe {
    line-height: 1px;
}
.gfi-theme-images {
    max-width: 600px;
    height: 100%;
}
.gfi-theme-images-image {
    margin: auto;
    display: block;
    text-align: center;
    color: black;
}
.favorite-icon-container {
    display: flex;
    justify-content: center;
    .bootstrap-icon {
        font-size: 28px;
        padding: 0 2px;
    }
}
.table {
    margin-bottom: 0;
}
</style>
