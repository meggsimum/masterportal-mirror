<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";
import actions from "../store/actionsLegend";

export default {
    name: "LegendMenu",
    components: {},
    data () {
        return {
            element: null,
            childNode: null
        };
    },
    computed: {
        ...mapGetters("Legend", Object.keys(getters)),
        ...mapGetters(["mobile", "uiStyle"])
    },
    mounted () {
        this.element = this.$el;
        this.childNode = this.$el.childNodes[0].childNodes[0];
        this.getLegendConfig();

        if (this.uiStyle === "TABLE") {
            document.getElementById("table-tools-menu").append(this.$el);
        }
        else {
            this.replaceMenuChild();
        }
    },
    updated () {
        this.replaceMenuChild();
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),

        /**
         * Replace legend in menu to provide order of menu in config.json.
         * root.replaceChild must be removed on refactoring menu to vue, then only use the else case.
         * @returns {void}
         */
        replaceMenuChild () {
            const root = document.getElementById("root");

            if (root && this.uiStyle !== "TABLE") {
                const span = root.querySelector("[name=legend]");

                if (this.mobile && span?.parentNode) {
                    root.replaceChild(this.element, span.parentNode);
                }
                else if (span?.parentNode?.parentNode) {
                    root.replaceChild(this.childNode, span.parentNode.parentNode);
                }
            }
        },

        /**
         * Toggles the visibility of the legend
         * @returns {void}
         */
        toggleLegend () {
            this.setShowLegend(!this.showLegend);
        }
    }
};
</script>

<template>
    <div :class="{ 'table-tool': uiStyle === 'TABLE'}">
        <ul
            v-if="!mobile && uiStyle !== 'TABLE'"
            id="legend-menu"
            class="nav navbar-nav"
        >
            <li
                v-if="showLegendInMenu"
                :class="{ 'open': showLegend }"
                class="dropdown dropdown-folder legend-menu-item"
                @click="toggleLegend"
                @keydown.enter.stop.prevent="toggleLegend"
                @keydown.space.stop.prevent="toggleLegend"
            >
                <a
                    href="#"
                    class="dropdown-toggle tabable"
                    tabindex="0"
                    :title="$t(name)"
                >
                    <span
                        :class="glyphicon"
                        class="glyphicon hidden-sm"
                    />
                    <span class="menuitem">{{ $t(name) }}</span>
                </a>
            </li>
        </ul>
        <ul
            v-if="mobile"
            id="legend-menu"
            class="list-group mobile"
        >
            <li
                v-if="showLegendInMenu"
                :class="{ open: showLegend }"
                class="list-group-item legend-menu-item"
                @click="toggleLegend"
                @keydown.enter="toggleLegend"
            >
                <div>
                    <span
                        :class="glyphicon"
                        class="glyphicon hidden-sm"
                    />
                    <span class="title">{{ $t(name) }}</span>
                </div>
            </li>
        </ul>
        <a
            v-if="!mobile && uiStyle === 'TABLE'"
            href="#"
            class="dropdown-toggle"
            @click="toggleLegend"
        >
            <span
                :class="glyphicon"
                class="glyphicon hidden-sm"
            />
            <span class="menuitem">{{ $t(name) }}</span>
        </a>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    #legend-menu {
        border-right: 1px solid #e5e5e5;
        font-size: 14px;
        cursor: pointer;
        .mobile {
            .list-group-item {
                padding: 12px 5px;
            }
            li {
                font-family: "MasterPortalFont", "Arial Narrow", Arial, sans-serif;
                padding-left: 6px;
                vertical-align: text-bottom;
            }
        }
    }
</style>
