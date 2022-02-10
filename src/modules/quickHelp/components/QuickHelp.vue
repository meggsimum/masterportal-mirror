<script>
import {mapMutations, mapGetters, mapActions} from "vuex";
import getComponent from "../../../utils/getComponent";
import getters from "../store/gettersQuickHelp";
import mutations from "../store/mutationsQuickHelp";
import ToolWindow from "../../../share-components/ToolWindow.vue";
import {translateKeyWithPlausibilityCheck} from "../../../utils/translateKeyWithPlausibilityCheck.js";
import {applyQuickHelpConfigsToDefaultContents} from "../utils/utilsQuickHelp.js";
import uniqueId from "../../../utils/uniqueId";
import configQuickHelp from "../configs/config.quickHelp.js";

export default {
    name: "QuickHelp",
    components: {
        ToolWindow
    },
    props: {
        /**
         * the quickHelp config object from config.js
         */
        quickHelpConfigJsObject: {
            type: [Object, Boolean],
            required: true
        }
    },
    data () {
        return {
            storePath: this.$store.state.QuickHelp,
            contentConfig: configQuickHelp,
            htmlContent: null
        };
    },
    computed: {
        ...mapGetters("QuickHelp", Object.keys(getters))
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                if (
                    Object.prototype.hasOwnProperty.call(this.contentConfig, this.quickHelpKey)
                    && Object.prototype.hasOwnProperty.call(this.contentConfig[this.quickHelpKey], "content")
                ) {
                    this.htmlContent = this.contentConfig[this.quickHelpKey];
                }
                else {
                    console.warn("error", "QuickHelp", "The content for the quickHelp Key", this.quickHelpKey, "can't be parsed.");
                }
            }
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.initialize();

            this.contentConfig = this.applyQuickHelpConfigsToDefaultContents(
                this.contentConfig,
                this.configs,
                this.quickHelpConfigJsObject,
                () => {
                    return uniqueId("info-");
                }
            );
        });
    },
    methods: {
        ...mapMutations("QuickHelp", Object.keys(mutations)),
        ...mapActions("QuickHelp", ["initialize"]),
        translateKeyWithPlausibilityCheck,
        applyQuickHelpConfigsToDefaultContents,

        /**
         * Translates the given translationKey or keeps a given text as it is if no translationKey is detected.
         * @param {String} translationKey the value or key to translate, if this is not a translation key, it will return the value as it is
         * @param {Object} [options=null] the options to use for the translation, if given translationKey must be a translation key
         * @returns {String} the translation or the given param as it is
         */
        translate (translationKey, options = null) {
            if (typeof options === "object" && options !== null) {
                return i18next.t(translationKey, options);
            }
            return this.translateKeyWithPlausibilityCheck(translationKey, v => i18next.t(v));
        },

        /**
         * Adds a slash to the given string if it is missing.
         * @param {String} imgPath the string to alter
         * @returns {String} the given string with one slash at the end
         */
        addSlashToImgPath (imgPath) {
            if (typeof imgPath === "string" && imgPath.charAt(imgPath.length - 1) !== "/") {
                return imgPath + "/";
            }
            return imgPath;
        },

        /**
         * Copies the current content into a new window and starts the print process of the browser.
         * @post a new tab or window is opened and the print process is started
         * @returns {void}
         */
        print () {
            const htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
                newWin = window.open("");

            newWin.document.write(htmlToPrint.outerHTML);
            newWin.print();
        },

        /**
         * Closes the window of quickHelp by setting store active to false.
         * @pre window is opened
         * @post window is closed
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolWindow
        v-if="active"
        id="quickHelp"
        class="quick-help-window"
        @close="close"
    >
        <template #title>
            <div>
                <span>{{ translate(htmlContent.title) }}</span>
            </div>
        </template>
        <template #rightOfTitle>
            <div class="heading-element">
                <span
                    tabindex="0"
                    class="glyphicon glyphicon-print"
                    @click="print"
                    @keydown.enter="print"
                />
            </div>
        </template>
        <template #body>
            <div class="body content container-fluid">
                <div class="table-of-contents">
                    <a
                        v-for="(section, key) in htmlContent.content"
                        :key="key"
                        :href="'#' + key"
                    >
                        {{ translate(section.title) }}
                    </a>
                </div>
                <div
                    v-for="(section, key) in htmlContent.content"
                    :key="key"
                >
                    <h3 :id="key">
                        {{ translate(section.title) }}
                    </h3>
                    <div
                        v-for="(subSection, listIndex) in section.list"
                        :key="listIndex"
                        class="row"
                    >
                        <p
                            v-if="subSection.type === 'text/plain'"
                            class="col-md-12"
                        >
                            {{ translate(subSection.text, subSection.interpolation) }}
                        </p>
                        <p
                            v-else-if="subSection.type === 'text/html'"
                            class="col-md-12"
                            v-html="translate(subSection.text, subSection.interpolation)"
                        />
                        <p
                            v-else-if="subSection.imgName"
                            class="col-md-12 quick-help-img"
                        >
                            <img
                                class="img-responsive img-thumbnail"
                                :src="addSlashToImgPath(subSection.imgPath) + subSection.imgName"
                                :alt="subSection.imgName"
                            >
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </ToolWindow>
</template>

<style lang="scss" scoped>
@import "~variables";

.quick-help-window {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
    width: 50%;
    height: 50%;
    margin: 0px;
    z-index: 2000;
}

.glyphicon-print {
    cursor: pointer;
    font-size: 16px;
}

.table-of-contents {
    >a {
        padding: 5px;
        margin: 5px;
        border: 1px solid silver;
        float: left;
        background: #ffffff;
        text-decoration: none;
        color: #333333;
    }
    >a:hover, a:focus {
        background-color: $accent_hover;
        color: $primary_contrast;
        cursor: pointer;
    }
}
.content.container-fluid h3:first-child{
    clear: both;
    padding-top: 15px;
}
.quick-help-img {
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
