<script>

import ModalItem from "../../../share-components/modals/components/ModalItem.vue";
import {mapActions, mapGetters} from "vuex";

export default {
    name: "ConfirmAction",

    components: {
        ModalItem
    },

    computed: {
        ...mapGetters("ConfirmAction", [
            "currentConfirmAction",
            "queue",
            "showTheModal"
        ])
    },

    methods: {
        ...mapActions("ConfirmAction", [
            "actionConfirmedCallback",
            "actionDeniedCallback",
            "actionEscapedCallback",
            "addSingleAction",
            "cleanup",
            "initialize"
        ]),

        /**
         * When closing the modal, remove the displayed confirmation action.
         * @returns {void}
         */
        onModalHid: function () {
            this.cleanup();
        }
    }
};
</script>

<template>
    <div>
        <ModalItem
            :show-modal="showTheModal"
            :force-click-to-close="currentConfirmAction.forceClickToClose"
            @modalHid="onModalHid"
            @clickedOnX="actionEscapedCallback"
            @clickedOutside="actionEscapedCallback"
        >
            <div id="confirmActionContainer">
                <h3>
                    {{ $t(currentConfirmAction.headline) }}
                </h3>
                <p
                    id="confirmation-textContent"
                    v-html="currentConfirmAction.textContent"
                />
                <div id="confirmation-button-container">
                    <button
                        id="modal-button-left"
                        class="btn btn-lgv-grey"
                        @click="actionConfirmedCallback"
                    >
                        {{ $t(currentConfirmAction.confirmCaption) }}
                    </button>
                    <button
                        id="modal-button-right"
                        class="btn btn-lgv-grey"
                        @click="actionDeniedCallback"
                    >
                        {{ $t(currentConfirmAction.denyCaption) }}
                    </button>
                </div>
            </div>
        </ModalItem>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    h3 {
        border:none;
        color: $secondary_contrast;
        font-size:14px;
        font-weight:bold;
        letter-spacing:initial;
        line-height:18px;
        padding:0;
    }
    #confirmation-textContent {
        color:#777777;
        font-size:12px;
    }
    #confirmation-button-container {
        overflow:hidden;
        margin-top:12px;
    }
    #modal-button-left {
        float:left;
        margin: 0 12px 0 0;
    }
    #modal-button-right {
        float:right;
        margin: 0 0 0 12px;
    }
</style>
