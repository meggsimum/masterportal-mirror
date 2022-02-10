<script>
import {mapGetters} from "vuex";

const fallbackTopRight = {
        key: "top-right-fallback",
        fallback: true
    },
    fallbackBottomRight = {
        key: "bottom-right-fallback",
        fallback: true
    };

/* TODO
 * This was the planned concept:
 * 1. scrollable if too many controls are included within
 * 2. open-/closable on mobile resolution, that is: only x (per default 3) control
 * controls are to be shown, and the rest can be opened/closed via a button
 * (think: openable toolbox); when open and place is not sufficient, the bar
 * is to be scrollable again
 *
 * However, positioning is currently in discussion, and a separate ticket
 * was made regarding the creation of a control concept. Stopping above implementation
 * in favour of stability until concept is ready.
 */

/**
 * Control layout component that places controls on the map.
 */
export default {
    name: "ControlBar",
    data () {
        return {
            categories: [
                {categoryName: "top", className: "top-controls"},
                {categoryName: "separator", className: "control-separator"},
                {categoryName: "bottom", className: "bottom-controls"}
            ]
        };
    },
    computed: {
        ...mapGetters(["controlsConfig", "mobile", "uiStyle"]),
        ...mapGetters("controls", ["componentMap", "mobileHiddenControls", "bottomControls"]),
        /** @returns {Object} contains controls to-be-rendered sorted by placement */
        categorizedControls () {
            const categorizedControls = {
                top: [],
                bottom: []
            };

            if (this.controlsConfig === null) {
                return {
                    top: [fallbackTopRight],
                    bottom: [fallbackBottomRight]
                };
            }

            Object
                .keys(this.controlsConfig)
                .filter(key => this.controlsConfig[key])
                .map(key => {
                    if (this.componentMap[key]) {
                        return {
                            component: this.componentMap[key],
                            props: typeof this.controlsConfig[key] === "object" ? this.controlsConfig[key] : {},
                            key
                        };
                    }
                    return key;
                })
                .filter(x => x !== "mousePosition") // "mousePosition" is currently handled in footer
                .forEach(c => {
                    if (this.bottomControls.includes(c.key)) {
                        categorizedControls.bottom.push(c);
                    }
                    else {
                        // defaulting to top-right corner
                        categorizedControls.top.push(c);
                    }
                });

            categorizedControls.top.push(fallbackTopRight);
            categorizedControls.bottom.unshift(fallbackBottomRight);

            return categorizedControls;
        }
    },
    methods: {
        /**
         * @param {String} componentName name of the control as noted in config.json
         * @returns {Boolean} true if control should be hidden in mobile screen width
         */
        hiddenMobile (componentName) {
            return this.mobileHiddenControls.includes(componentName);
        },
        isSimpleStyle () {
            return this.uiStyle === "SIMPLE";
        }
    }
};
</script>

<template>
    <ul
        v-if="!isSimpleStyle()"
        class="right-bar"
    >
        <template v-for="({categoryName, className}, categoryIndex) in categories">
            <li
                v-if="categoryName === 'separator'"
                :key="categoryIndex"
                :class="className"
                aria-hidden="true"
            />
            <template
                v-for="(control, index) in categorizedControls[categoryName]"
                v-else
            >
                <!--
                NOTE This li is a temporary implementation. As soon as "old-style" controls
                are no longer supported, this li and related contents may be deleted.
                -->
                <li
                    v-if="control.fallback"
                    :id="control.key"
                    :key="control.key"
                    :class="[
                        'backwards-compatibility-controls',
                        className
                    ]"
                />
                <li
                    v-else
                    :key="`${categoryIndex}-${index}`"
                >
                    <component
                        :is="control.component"
                        :key="control.key"
                        :class="[
                            index !== categorizedControls[categoryName].length - 1 ? 'spaced' : '',
                            mobile && hiddenMobile(control.key) ? 'hidden' : '',
                            className
                        ]"
                        v-bind="control.props"
                    />
                </li>
            </template>
        </template>
    </ul>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .right-bar {
        pointer-events: none;

        padding: 5px;
        margin: 5px 5px 12px 5px;

        display: flex;
        flex-direction: column;

        list-style-type: none;

        .control-separator {
            flex-grow: 1;
        }

        .hidden {
            display: none;
        }

        .spaced {
            margin-bottom: 0.5em;
        }

        .top-controls, .bottom-controls {
            pointer-events: all;
        }
    }
</style>

<style lang="scss">
    /* using this classname to scope css effects; can not use scoped scss here since controls are not within scope, but added by jQuery */
    .backwards-compatibility-controls {
        $color_1: #f3f3f3;
        $background_color_1: #E10019;
        $background_color_2: rgb(8,88,158);
        /* use old styling way for glyphicons for old controls */
        .glyphicon {
            color: $color_1;
            background-color: $background_color_1;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
            &:hover {
                cursor: pointer;
                opacity: 0.7;
            }
        }
        > .toggleButtonPressed {
            background-color: $background_color_2;
        }
        /* forcing compatibility by overriding old-style layouting */
        .controls-row-right {
            position: relative;
            margin-right: 0;
            min-height: 0;
        }
        .row {
            margin-right: 0;
            margin-left: 0;
        }
        > div {
            padding: 5px;
            > div {
                margin-top: 0;
            }
        }
    }
</style>
