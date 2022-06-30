import axios from "axios";
import * as moment from "moment";
import xml2json from "../utils/xml2json";
import getNestedValues from "../../utils/getNestedValues";
import handleAxiosError from "../utils/handleAxiosError.js";

/**
 * Handles the GetRecordById request.
 * @param {String} url - the csw request url
 * @param {String} metadataId - the metadata id
 * @param {String} [outputSchema="http://www.isotc211.org/2005/gmd"] - the output schema of the response
 * @param {String} [elementSetName="full"] - specify which properties are included in the response
 * @param {String} [version="2.0.2"] - csw api version
 * @returns {Promise<Object|undefined>}  Promise object represents the GetFeatureInfo request
 */
export function getRecordById (url, metadataId, outputSchema = "http://www.isotc211.org/2005/gmd", elementSetName = "full", version = "2.0.2") {
    return axios.get(url, {
        params: {
            service: "CSW",
            request: "GetRecordById",
            version: version,
            outputschema: outputSchema,
            elementsetname: elementSetName,
            id: metadataId
        }
    })
        .then(response => xml2json(response.request.responseXML))
        .then(json => getMetadata(json))
        .catch(error => handleAxiosError(error, "getRecordById"));
}

/**
 * Gets an object for specific metadata.
 * @param {Object} json - the response of getRecordById as JSON
 * @returns {Object} metadata
 */
export function getMetadata (json) {
    return {
        getTitle: () => parseTitle(json),
        getAbstract: () => parseAbstract(json),
        getFrequenzy: () => parseFrequenzy(json),
        getPublicationDate: () => parseDate(json, "publication"),
        getCreationDate: () => parseDate(json, "creation"),
        getRevisionDate: () => parseDate(json, "revision"),
        getDownloadLinks: () => parseDownloadLinks(json),
        getOwner: () => parseContactByRole(json, "owner")
    };
}

/**
 * Gets the MD_Identification node.
 * MD_Identification may be implemented as MD_DataIdentification or SV_ServiceIdentification.
 * @param {Object} json The csw result json .
 * @see {@link https://portal.ogc.org/files/?artifact_id=56905}
 * @see {@link http://portal.opengeospatial.org/files/?artifact_id=6495}
 * @returns {Object|Object[]} todo
 */
export function getMdIdentification (json) {
    return json.GetRecordByIdResponse?.MD_Metadata?.identificationInfo?.MD_DataIdentification
        ||
        json.GetRecordByIdResponse?.MD_Metadata?.identificationInfo?.SV_ServiceIdentification;
}

/**
 * Gets the title of the metadata.
 * @param {Object} json - the response
 * @returns {String} title
 */
export function parseTitle (json) {
    return getMdIdentification(json)?.citation?.CI_Citation?.title?.CharacterString?.getValue();
}

/**
 * Gets the abstract of the metadata.
 * @param {Object} json - the response
 * @returns {String} abstract
 */
function parseAbstract (json) {
    let abstractData = getMdIdentification(json)?.abstract?.CharacterString?.getValue();
    const match = (/\r|\n/).exec(abstractData);

    if (match) {
        abstractData = abstractData.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/(<br ?\/?>)+/gi, "<br>").replace(/(<br ?\/?>)+/gi, "</p><p>");
    }

    return "<p>" + abstractData + "</p>";
}

/**
 * Gets the update frequency of the metadata.
 * @param {Object} json - the response
 * @returns {String|undefined} update frequency
 */
function parseFrequenzy (json) {
    const attributes = getMdIdentification(json)?.resourceMaintenance?.MD_MaintenanceInformation?.maintenanceAndUpdateFrequency?.MD_MaintenanceFrequencyCode?.getAttributes(),
        frequencyTypes = {
            continual: "common:modules.cswParser.continual",
            daily: "common:modules.cswParser.daily",
            weekly: "common:modules.cswParser.weekly",
            fortnightly: "common:modules.cswParser.fortnightly",
            monthly: "common:modules.cswParser.monthly",
            quarterly: "common:modules.cswParser.quarterly",
            biannually: "common:modules.cswParser.biannually",
            annually: "common:modules.cswParser.annually",
            asNeeded: "common:modules.cswParser.asNeeded",
            irregular: "common:modules.cswParser.irregular",
            notPlanned: "common:modules.cswParser.notPlanned",
            unknown: "common:modules.cswParser.unknown"
        };

    if (attributes?.codeListValue) {
        return frequencyTypes[attributes.codeListValue];
    }
    return undefined;
}

/**
 * Gets the date of the metadata by the given type
 * @param {Object} json - the response
 * @param {String} dateType - the type of the date (e.g. publication)
 * @returns {String|undefined} formatted date
 */
function parseDate (json, dateType) {
    const dates = getMdIdentification(json)?.citation?.CI_Citation?.date;
    let dateValue;

    if (Array.isArray(dates)) {
        dates.forEach(date => {
            if (date?.CI_Date?.dateType?.CI_DateTypeCode?.getAttributes()?.codeListValue === dateType) {
                dateValue = date.CI_Date?.date?.DateTime?.getValue() || date.CI_Date?.date?.Date?.getValue();
            }
        });
    }
    else if (dates?.CI_Date?.dateType?.CI_DateTypeCode?.getAttributes()?.codeListValue === dateType) {
        dateValue = dates.CI_Date?.date?.DateTime?.getValue() || dates.CI_Date?.date?.Date?.getValue();
    }

    return typeof dateValue !== "undefined" ? moment(dateValue).format("DD.MM.YYYY") : dateValue;
}

/**
 * Gets the download links of the metadata
 * @param {Object} json - the response
 * @returns {Object[]|null} download links
 * @see {@link https://www.isotc211.org/2005/gmd/distribution.xsd}
 * @see {@link https://www.gdi-de.org/sites/default/files/2020-03/Deutsche_Uebersetzung_der_ISO-Felder.pdf}
 */
function parseDownloadLinks (json) {
    const transferOptions = json.GetRecordByIdResponse?.MD_Metadata?.distributionInfo?.MD_Distribution?.transferOptions,
        downloadResources = [];

    if (typeof transferOptions === "object" && transferOptions !== null) {
        const onlineResources = getNestedValues(transferOptions, "CI_OnlineResource");

        onlineResources.forEach(resource => {
            if (resource?.function?.CI_OnLineFunctionCode?.getAttributes().codeListValue === "download") {
                downloadResources.push({
                    // location (address) for on-line access
                    link: resource?.linkage?.URL.getValue(),
                    // name of the online resource
                    linkName: resource?.name?.CharacterString.getValue() || resource?.description?.CharacterString.getValue() || resource?.linkage?.URL.getValue()
                });
            }
        });
    }

    return downloadResources.length > 0 ? downloadResources : null;
}

/**
 * Parses the contact by the given role.
 * @param {Object} json - the response
 * @param {String} role - the role of the contact (e.g. owner)
 * @returns {String} name of the contact
 */
function parseContactByRole (json, role) {
    const pointOfContacts = getMdIdentification(json)?.pointOfContact;
    let dateValue = {};

    if (Array.isArray(pointOfContacts)) {
        pointOfContacts.forEach(contact => {
            if (contact?.CI_ResponsibleParty?.role?.CI_RoleCode?.getAttributes()?.codeListValue === role) {
                dateValue = {
                    name: contact.CI_ResponsibleParty?.organisationName?.CharacterString?.getValue(),
                    street: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.deliveryPoint?.CharacterString?.getValue(),
                    housenr: "",
                    postalCode: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.postalCode?.CharacterString?.getValue(),
                    city: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.city?.CharacterString?.getValue(),
                    email: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.electronicMailAddress?.CharacterString?.getValue(),
                    phone: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.phone?.CI_Telephone?.voice?.CharacterString?.getValue(),
                    link: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.onlineResource?.CI_OnlineResource?.linkage?.URL?.getValue()
                };
            }
        });
    }
    else if (pointOfContacts?.CI_ResponsibleParty?.role?.CI_RoleCode?.getAttributes()?.codeListValue === role) {
        dateValue = {
            name: pointOfContacts.CI_ResponsibleParty?.organisationName?.CharacterString?.getValue(),
            street: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.deliveryPoint?.CharacterString?.getValue(),
            housenr: "",
            postalCode: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.postalCode?.CharacterString?.getValue(),
            city: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.city?.CharacterString?.getValue(),
            email: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.electronicMailAddress?.CharacterString?.getValue(),
            phone: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.phone?.CI_Telephone?.voice?.CharacterString?.getValue(),
            link: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.onlineResource?.CI_OnlineResource?.linkage?.URL?.getValue()
        };
    }

    return dateValue;
}
