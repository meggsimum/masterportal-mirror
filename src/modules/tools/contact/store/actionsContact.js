import {createMessage, createSubject, createTicketId} from "../utils/createFunctions";
import httpClient from "../utils/httpClient";
import getSystemInfo from "../utils/getSystemInfo";
import getComponent from "../../../../utils/getComponent";

const actions = {
    /**
     * This action gets called after an e-mail has successfully been sent.
     * If configured, the ticketId is included in the Alert for the user.
     * If configured, the input is cleared and the tool is closed afterwards.
     *
     * @param {String} ticketId The unique id of the ticket for the e-mail.
     * @return {void}
     */
    onSendSuccess: ({state, commit, dispatch}, ticketId) => {
        const {closeAfterSend, deleteAfterSend, withTicketNo, id} = state;
        let content = i18next.t("common:modules.tools.contact.successMessage");

        if (withTicketNo) {
            content += "\r\n";
            content += i18next.t("common:modules.tools.contact.successTicket");
            content += ticketId;
        }

        dispatch("Alerting/addSingleAlert", {content}, {root: true});

        // Always uncheck the privacy policy
        commit("setPrivacyPolicyAccepted", false);

        if (deleteAfterSend) {
            commit("setMail", "");
            commit("setMessage", "");
            commit("setPhone", "");
            commit("setUsername", "");
        }
        if (closeAfterSend) {
            // TODO dedupe as action
            commit("setActive", false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(id);

            if (model) {
                model.set("isActive", false);
            }
        }
    },
    /**
     * Dispatch delegator to avoid code repetition. Dispatches single warning alert.
     *
     * @param {String} content String or locale key to show.
     * @returns {void}
     */
    showWarningAlert ({dispatch}, content) {
        dispatch(
            "Alerting/addSingleAlert",
            {content: i18next.t(content), category: "Warning"},
            {root: true}
        );
    },
    /**
     * Builds a HTML E-Mail and sends it via the backend mail server.
     *
     * @returns {void}
     */
    send: ({state, dispatch, getters, rootGetters}) => {
        const {to, from, serviceId, serviceID, includeSystemInfo} = state,
            id = serviceId || serviceID,
            systemInfo = getSystemInfo(rootGetters.portalTitle),
            mailServiceUrl = rootGetters.getRestServiceById(id).url,
            ticketId = createTicketId(state.locationOfCustomerService);

        // stop sending if form is not valid
        if (!getters.validForm) {
            console.warn("An error occurred sending an email: send with incorrect fields aborted");
            dispatch("showWarningAlert", "common:modules.tools.contact.errorIncompleteDeclarations");
            return;
        }

        // stop sending if mail service is not defined
        if (!mailServiceUrl) {
            console.warn(`"An error occurred sending an e-mail: serviceId ${id} is unknown.`);
            dispatch("showWarningAlert", "common:modules.tools.contact.error.message");
            return;
        }

        // Show the loader when the dispatch of the e-mail is initiated.
        httpClient(
            mailServiceUrl,
            {
                from,
                to,
                subject: createSubject(
                    ticketId,
                    state.subject || (i18next.t("common:modules.tools.contact.mailSubject") + systemInfo.portalTitle)
                ),
                text: createMessage(state, includeSystemInfo ? systemInfo : null)
            },
            () => dispatch("onSendSuccess", ticketId),
            () => dispatch("showWarningAlert", "common:modules.tools.contact.error.message")
        );
    }
};

export default actions;
