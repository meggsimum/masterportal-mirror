<script>
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

/**
 * Enables fullscreen using browser tools.
 * @returns {Boolean} if true: fullscreen has been enabled; if false: unable to enable fullscreen
 */
function openFullScreen () {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        return true;
    }
    else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        return true;
    }
    else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        return true;
    }
    else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        return true;
    }

    return false;
}

/**
 * Disables fullscreen using browser tools if fullscreen was enabled before using the same browser tools.
 * @returns {Boolean} if true: fullscreen has been disabled; if false: unable to disable fullscreen
 */
function closeFullScreen () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        return true;
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        return true;
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
        return true;
    }
    else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        return true;
    }

    return false;
}


/**
 * checks if the browser is currently in fullscreen
 * @returns {Boolean}  true - the browser is currently in fullscreen mode
 */
function isFullScreen () {
    return Boolean(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
}

/**
 * FullScreen control that allows switching between fullscreen
 * and normal mode for the map. May also open a new tab if the
 * instance is running in an iFrame.
 */
export default {
    name: "FullScreen",
    data: function () {
        return {
            active: isFullScreen()
        };
    },
    computed: {
        component () {
            return Radio.request("Util", "getUiStyle") === "TABLE" ? TableStyleControl : ControlIcon;
        }
    },
    mounted () {
        document.addEventListener("mozfullscreenchange", this.escapeHandler);
        document.addEventListener("MSFullscreenChange", this.escapeHandler);
        document.addEventListener("webkitfullscreenchange", this.escapeHandler);
        document.addEventListener("fullscreenchange", this.escapeHandler);
    },
    methods: {
        /**
         * Defines the variable "active" depending on whether the fullscreenmode is activated or deactivated.
         * Is necessary to capture the termination of the fullscreenmode via the ESC key and to render the fullscreenbutton correctly (on/off) in the further process.
         * @returns {void}
         */
        escapeHandler () {
            this.active = isFullScreen();
        },

        /**
         * Toggles between fullscreen and normal screen.
         * @returns {void}
         */
        toggleFullScreen () {
            // if portal is in an iframe, it can't be set to fullscreen - open new tab for better access
            if (window.self !== window.top) {
                window.open(window.location.href, "_blank");
                return;
            }
            if (this.active) {
                this.active = !closeFullScreen();
            }
            else {
                this.active = openFullScreen();
            }
        }
    }
};
</script>

<template>
    <div class="fullscreen-button">
        <component
            :is="component"
            :title="$t(`common:modules.controls.fullScreen.${active ? 'disable' : 'enable'}`)"
            :icon-name="active ? 'arrows-angle-contract' : 'arrows-angle-expand'"
            :on-click="toggleFullScreen"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
</style>
