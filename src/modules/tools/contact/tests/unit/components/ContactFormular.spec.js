import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ContactComponent from "../../../components/ContactFormular.vue";
import ContactModule from "../../../store/indexContact";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

localVue.use(Vuex);

/**
 * Fills all form fields with joke data for testing..
 * @param {object} parameters holds the text inputs
 * @returns {void}
 */
function fillFields ({nameInput, mailInput, phoneInput, messageInput}) {
    nameInput.element.value = "Chuck Testa";
    nameInput.trigger("keyup");
    mailInput.element.value = "testa@example.com";
    mailInput.trigger("keyup");
    phoneInput.element.value = "555";
    phoneInput.trigger("keyup");
    messageInput.element.value = "Thought this was a deer?";
    messageInput.trigger("keyup");
}

describe("src/modules/tools/contact/components/ContactFormular.vue", () => {
    let store, wrapper;

    beforeEach(() => {
        ContactModule.actions.send = sinon.spy();
        ContactModule.actions.onSendSuccess = sinon.spy();

        ContactModule.state.serviceID = undefined;

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Contact: ContactModule
                    }
                }
            },
            getters: {
                uiStyle: () => sinon.stub()
            }
        });

        store.commit("Tools/Contact/setActive", true);
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("has a disabled save button if the form is not completed", () => {
        wrapper = mount(ContactComponent, {store, localVue});

        const sendButton = wrapper.find("#tool-contact-send-message");

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes("disabled")).to.equal("disabled");
    });

    it("has an enabled & working save button if the form is completed", async () => {
        wrapper = mount(ContactComponent, {store, localVue});

        const sendButton = wrapper.find("#tool-contact-send-message"),
            nameInput = wrapper.find("#tool-contact-username-input"),
            mailInput = wrapper.find("#tool-contact-mail-input"),
            phoneInput = wrapper.find("#tool-contact-phone-input"),
            messageInput = wrapper.find("#tool-contact-message-input");

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes().disabled).not.to.equal("disabled");

        sendButton.trigger("submit");
        expect(ContactModule.actions.send.calledOnce).to.be.true;
    });

    it("keeps the send button disabled if any field is missing", async () => {

        wrapper = mount(ContactComponent, {store, localVue});

        const sendButton = wrapper.find("#tool-contact-send-message"),
            nameInput = wrapper.find("#tool-contact-username-input"),
            mailInput = wrapper.find("#tool-contact-mail-input"),
            phoneInput = wrapper.find("#tool-contact-phone-input"),
            messageInput = wrapper.find("#tool-contact-message-input");

        for (const emptyInput of [nameInput, mailInput, phoneInput, messageInput]) {
            fillFields({nameInput, mailInput, phoneInput, messageInput});

            emptyInput.element.value = "";
            emptyInput.trigger("keyup");

            await wrapper.vm.$nextTick();

            expect(sendButton.exists()).to.be.true;
            expect(sendButton.attributes().disabled).to.equal("disabled");
        }
    });

    it("optionally renders an additional info field and privacy policy checkbox; must tick checkbox to send form", async () => {
        ContactModule.state.contactInfo = "If you live nearby, why not shout the message out from your window at 3AM?";
        ContactModule.state.showPrivacyPolicy = true;

        wrapper = mount(ContactComponent, {store, localVue});

        const sendButton = wrapper.find("#tool-contact-send-message"),
            nameInput = wrapper.find("#tool-contact-username-input"),
            mailInput = wrapper.find("#tool-contact-mail-input"),
            phoneInput = wrapper.find("#tool-contact-phone-input"),
            messageInput = wrapper.find("#tool-contact-message-input"),
            checkbox = wrapper.find("#tool-contact-privacyPolicy-input");

        expect(wrapper.find("#tool-contact-addionalInformation").exists()).to.be.true;
        expect(checkbox.exists()).to.be.true;

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).to.equal("disabled");

        checkbox.trigger("click");
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).not.to.equal("disabled");
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = mount(ContactComponent, {store, localVue, attachTo: elem});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#tool-contact-username-input").element).to.equal(document.activeElement);
    });
});
