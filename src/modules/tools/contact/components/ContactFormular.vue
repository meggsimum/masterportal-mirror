<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
import ContactFormularInput from "./ContactFormularInput.vue";
import {keyStore} from "../store/constantsContact";

export default {
    name: "ContactFormular",
    components: {
        ToolTemplate,
        ContactFormularInput
    },
    computed: {
        ...mapGetters("Tools/Contact", keyStore.getters)
    },
    created () {
        this.$on("close", this.close);
        // warn if deprecated param is used
        if (this.serviceID) {
            console.warn("Contact Tool: The parameter 'serviceID' is deprecated in the next major release! Please use serviceId instead.");
        }
    },
    methods: {
        ...mapMutations("Tools/Contact", keyStore.mutations),
        ...mapActions("Tools/Contact", keyStore.actions),

        close () {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div
                v-if="contactInfo"
                id="tool-contact-addionalInformation"
                class="form-group contents"
            >
                {{ contactInfo }}
            </div>
            <form
                class="contents"
                @submit.prevent="send"
            >
                <ContactFormularInput
                    :change-function="setUsername"
                    input-name="username"
                    :input-value="username"
                    label-text="Name"
                    :valid-input="validUsername"
                    :focus-on-creation="true"
                    autocomplete="name"
                />
                <ContactFormularInput
                    :change-function="setMail"
                    input-name="mail"
                    input-type="email"
                    :input-value="mail"
                    label-text="E-Mail"
                    :valid-input="validMail"
                    autocomplete="email"
                />
                <ContactFormularInput
                    :change-function="setPhone"
                    input-name="phone"
                    input-type="tel"
                    :input-value="phone"
                    label-text="Tel."
                    :valid-input="validPhone"
                    autocomplete="tel"
                />
                <ContactFormularInput
                    :change-function="setMessage"
                    html-element="textarea"
                    input-name="message"
                    :input-value="message"
                    :label-text="$t('common:modules.tools.contact.messageLabel')"
                    :rows="maxLines"
                    :valid-input="validMessage"
                />
                <div
                    v-if="showPrivacyPolicy"
                    id="tool-contact-privacyPolicy"
                    class="form-group"
                >
                    <label
                        id="tool-contact-privacyPolicy-label"
                        for="tool-contact-privacyPolicy-input"
                    >
                        <input
                            id="tool-contact-privacyPolicy-input"
                            :value="privacyPolicyAccepted"
                            type="checkbox"
                            @click="togglePrivacyPolicyAccepted"
                        >
                        {{ $t("common:modules.tools.contact.privacyPolicy.label") }}
                    </label>
                    <p v-html="$t('common:modules.tools.contact.privacyPolicy.info', {privacyPolicyLink})" />
                </div>
                <button
                    id="tool-contact-send-message"
                    type="submit"
                    class="btn btn-primary float-end"
                    :disabled="!validForm"
                >
                    {{ $t("common:modules.tools.contact.sendButton") }}
                </button>
            </form>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~variables";

    input[type="checkbox"] {
        cursor: pointer;
    }

    #tool-contact-privacyPolicy {
        label, span {
            cursor: pointer;
        }
    }

    .contents {
        /* avoids making the form broader */
        max-width: 300px;
    }
</style>
