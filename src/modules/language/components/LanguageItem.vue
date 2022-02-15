<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersLanguage";

export default {
    name: "LanguageItem",
    data () {
        return {
            showWindow: false
        };
    },
    computed: {
        ...mapGetters("Language", Object.keys(getters))
    },
    created: function () {
        this.setCurrentLocale(this.$i18n.i18next.language);
    },
    methods: {
        ...mapMutations("Language", ["setCurrentLocale"]),
        translate (language) {
            i18next.changeLanguage(language, () => {
                this.setCurrentLocale(language);
            });
        },
        toggleLanguageWindow () {
            this.showWindow = !this.showWindow;
        }
    }
};
</script>

<template lang="html">
    <div
        id="language-bar"
    >
        <a
            class="current-language"
            role="button"
            tabindex="0"
            @click="toggleLanguageWindow"
            @keydown.enter="toggleLanguageWindow"
        >
            {{ $i18n.i18next.language }}
        </a>
        <div
            v-if="showWindow"
            class="popup-language"
        >
            <div class="language-header">
                <div>
                    {{ $t("modules.language.languageTitle") }}
                </div>
                <a
                    role="button"
                    class="buttons pull-right"
                    tabindex="0"
                    @click="toggleLanguageWindow"
                    @keydown.enter="toggleLanguageWindow"
                >
                    <span
                        class="glyphicon glyphicon-remove"
                    />
                    <span class="screenreader">$t("modules.language.toggleWindow"</span>
                </a>
            </div>
            <div class="form-group form-group-sm">
                <div
                    v-for="(value, key) in $i18n.i18next.options.getLanguages()"
                    :key="key"
                    class="col-lg-6 col-md-6 col-sm-6 col-xs-12"
                >
                    <button
                        class="lng btn"
                        :disabled="key === $i18n.i18next.language"
                        @click="translate(key)"
                    >
                        {{ $t("modules.language." + key) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~/css/mixins.scss";

    #language-bar {
        a {
            color: darken($secondary_focus, 10%);
            &:hover{
                @include primary_action_hover;
            }
        }

        margin-left: 10px;
        .current-language {
            display: block;
            position: relative;
            color: #1F4B70;

            cursor: pointer;

            text-transform: uppercase;
            font-weight: bold;
        }
        .screenreader {
            position: absolute;
            left:-9999px;
        }
        .popup-language {
            position: absolute;

            bottom: calc(100% + 8px);
            right: 8px;

            padding: 10px 0 20px;

            min-width: 400px;

            background: $secondary;
            box-shadow: $shadow;

            .language-header {
                float: right;
                width: 100%;
                border-bottom: 1px solid #e5e5e5;
                padding: 0 0 3px 10px;
                span {
                    width: 30px;
                    cursor: pointer;
                }
            }
            .form-group {
                display: inline-block;
                width: 100%;
                text-align: center;
                padding: 20px 0 0;
                a {
                    font-size: 12px;
                    &:hover{
                        // @include primary_action_hover;
                        // background-color: #08589e;
                        // color: #ffffff;
                    }
                    &.disabled {
                        background-color: #e7e7e7;
                    }
                }
            }
        }
    }

    @media (max-width: 767px) {
        #language-bar {
            .current-language {
                float: right;
                text-align: right;
            }
            .popup-language {
                width: calc(100% - 20px);
                min-width: inherit;
                right: 10px;
            }
        }
    }
</style>
