import testAction from "../../../../../../../test/unittests/VueTestUtils.js";
import {expect} from "chai";
import sinon from "sinon";

import * as getComponent from "../../../../../../utils/getComponent";
import * as httpClient from "../../../utils/httpClient";
import actions from "../../../store/actionsContact";

const {onSendSuccess, send} = actions;

describe("src/modules/tools/contact/store/actionsContact.js", () => {
    describe("onSendSuccess", () => {
        const payload = "0401-TICK-ETID";
        let state;

        beforeEach(() => {
            state = {
                id: "contact",
                closeAfterSend: true,
                deleteAfterSend: true,
                withTicketNo: true
            };
            sinon
                .stub(getComponent, "default")
                .callsFake(() => ({set: () => { /* noop */ }}));
        });

        afterEach(sinon.restore);

        it("calls all expected commits and dispatches when configured to do so", done => {
            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    content: i18next.t("common:modules.tools.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.tools.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true},
                {type: "setActive", payload: false, commit: true}
            ], {}, done);
        });

        it("builds reduced alert message when configured so", done => {
            state.withTicketNo = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    content: i18next.t("common:modules.tools.contact.successMessage")
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true},
                {type: "setActive", payload: false, commit: true}
            ], {}, done);
        });

        it("doesn't reset form when configured so", done => {
            state.deleteAfterSend = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    content: i18next.t("common:modules.tools.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.tools.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setActive", payload: false, commit: true}
            ], {}, done);
        });

        it("doesn't close form when configured so", done => {
            state.closeAfterSend = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    content: i18next.t("common:modules.tools.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.tools.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true}
            ], {}, done);
        });
    });

    describe("send", () => {
        let state;

        beforeEach(() => {
            state = {
                from: Symbol.for("from"),
                to: Symbol.for("to"),
                serviceId: "007",
                includeSystemInfo: true
            };
        });

        afterEach(sinon.restore);

        it("creates httpClient call as expected", done => {
            sinon
                .stub(httpClient, "default")
                .callsFake((url, data) => {
                    const {from, to, subject, text} = data;

                    expect(url).to.equal("example.com");
                    expect(from).to.equal(Symbol.for("from"));
                    expect(to).to.equal(Symbol.for("to"));
                    expect(subject).to.be.a("string");
                    expect(text).to.be.a("string");

                    done();
                });

            send({
                state,
                dispatch: sinon.spy(),
                getters: {
                    validForm: true
                },
                rootGetters: {
                    portalTitle: "Test",
                    getRestServiceById: id => id === "007" ? {url: "example.com"} : {}
                }
            });
        });
    });
});
