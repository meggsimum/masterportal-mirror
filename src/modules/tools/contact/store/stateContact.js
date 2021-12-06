/**
 * Contact tool state definition.
 * @typedef {Object} ContactState
 * @property {Boolean} active If true, SaveSelection will be rendered.
 * @property {String} id Id of the Contact component.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} icon Icon next to the title. (config-param)
 * @property {Boolean} renderToWindow If true, tool is rendered in a window, else in the sidebar. (config-param)
 * @property {Boolean} resizableWindow If true, window is resizable. (config-param)
 * @property {Boolean} isVisibleInMenu If true, tool is selectable in menu. (config-param)
 * @property {Boolean} deactivateGFI Flag determining if the tool should deactivate GFI. (config-param)
 * @property {String} serviceId The id of the service (rest-services.json) that contains the url of the mail service. (config-param)
 * @property {Object[]} from Default sender for the e-mail. (config-param)
 * @property {Object[]} to Default recipient of the e-mail. (config-param)
 * @property {Boolean} [closeAfterSend=true] Flag determining if the contact window should be closed after an E-Mail has been sent. (config-param)
 * @property {String} [contactInfo=""] Additional text shown above the contact form. (config-param)
 * @property {Boolean} [deleteAfterSend=true] Flag determining if the input fields should be emptied after an E-Mail has been sent. (config-param)
 * @property {Boolean} [includeSystemInfo=false] Flag determining if information of the the system of the user should be included in the E-Mail. (config-param)
 * @property {String} [locationOfCustomerService="de"] The country the customer service is based in. The parameter is used for the date in the ticketId. (config-param)
 * @property {Number} [maxLines=5] Amount of lines (height) for the textArea of the form. (config-param)
 * @property {Boolean} [showPrivacyPolicy=true] Flag determining if a checkbox should be displayed for agreeing to the privacy policy. (config-param)
 * @property {String} [subject=""] The subject to be used for the E-Mail. (config-param)
 * @property {Boolean} [withTicketNo=true] Flag determining if the ticketId should be shown to the user after an E-Mail has been sent. (config-param)
 * @property {String} mail The mail address that the user entered.
 * @property {String} message The message that the user entered.
 * @property {Boolean} privacyPolicyAccepted Whether the user has accepted the privacy policy or not.
 * @property {String} phone The phone number that the user has entered.
 * @property {String} username The name of the user.
 * @property {String} serviceID _Deprecated. This field will no longer be used in the next major release._ The id of the service (rest-services.json) that contains the url of the mail service. (config-param)
 */
const state = {
    active: false,
    id: "contact",
    // defaults for config.json tool parameters
    name: "common:menu.contact",
    icon: "bi-envelope-fill",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    from: [],
    serviceId: null,
    to: [],
    closeAfterSend: true,
    contactInfo: "",
    deleteAfterSend: true,
    includeSystemInfo: false,
    locationOfCustomerService: "de",
    maxLines: 5,
    showPrivacyPolicy: false,
    privacyPolicyLink: "https://www.masterportal.org/datenschutz.html",
    subject: "",
    withTicketNo: true,
    serviceID: null,
    // contact state
    mail: "",
    message: "",
    privacyPolicyAccepted: false,
    phone: "",
    username: ""
};

export default state;
