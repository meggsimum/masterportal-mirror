import Model from "@modules/tools/wfst/model.js";
import {expect} from "chai";
import Util from "@testUtil";
import {Draw} from "ol/interaction.js";
import sinon from "sinon";
import VectorSource from "ol/source/Vector";

describe("WfstModel", function () {
    let model,
        utilModel,
        dftNonHierXml,
        dftNonHierXmlPrefix,
        dftHierXml,
        dftHierXmlPrefix,
        gfiAttributes,
        transactionResponseInsert,
        transactionResponseDelete,
        transactionResponseUpdate,
        transactionFailedResponse,
        transactionJqXHR,
        features,
        drawLayer;
    const attributeFields = [],
        attributeFieldsPointGeom = [],
        wfstFields = [];

    before(() => {
        mapCollection.clear();
        mapCollection.addMap({
            mode: "2D",
            addNewLayerIfNotExists: sinon.spy(),
            addInteraction: sinon.spy(),
            registerListener: sinon.spy(),
            removeInteraction: sinon.spy()
        }, "2D");

        model = new Model();
        utilModel = new Util();

        let newField;
        // Different describe feature type responses
        const dftNonHierarchicalResponse = utilModel.getFile("resources/testNonHierarchicalDftResponse.xml"),
            dftNonHierarchicalResponsePrefix = utilModel.getFile("resources/testNonHierarchicalDftResponsePrefix.xml"),
            dftHierarchicalResponse = utilModel.getFile("resources/testHierarchicalDftResponse.xml"),
            dftHierarchicalResponsePrefix = utilModel.getFile("resources/testHierarchicalDftResponsePrefix.xml"),
            // Attribute fields from an example feature with no special geometry type
            attributeFieldsFile = utilModel.getFile("resources/testAttributeFields.xml"),
            xmlAttrFields = utilModel.parseXML(attributeFieldsFile),
            // Attribute fields from an example feature with point geometry type
            attributeFieldsPointGeomFile = utilModel.getFile("resources/testAttributeFieldsPointGeom.xml"),
            xmlAttrFields2 = utilModel.parseXML(attributeFieldsPointGeomFile),
            wfstFieldsStr = utilModel.getFile("resources/wfstFields.txt").split(/(?<=},)/),
            transactionJqXHRFile = utilModel.getFile("resources/testTransactionJqXHR.xml"),
            drawAttr = {
                "active": true,
                "name": "Max Mustermann",
                "vorhaben": "Testen",
                "anfragedatum": "2020-01-28",
                "bemerkung": "Dies ist ein Punkt",
                "vorgangsnummer": 3,
                "testnummer": 1.3,
                "istest": false
            };

        // Different describe feature type responses
        dftNonHierXml = utilModel.parseXML(dftNonHierarchicalResponse);
        dftNonHierXmlPrefix = utilModel.parseXML(dftNonHierarchicalResponsePrefix);
        dftHierXml = utilModel.parseXML(dftHierarchicalResponse);
        dftHierXmlPrefix = utilModel.parseXML(dftHierarchicalResponsePrefix);

        // Attribute fields from an example feature with no special geometry type
        $(xmlAttrFields).find("element").each(function (index, e) {
            attributeFields.push(e);
        });

        // Attribute fields from an example feature with point geometry type
        $(xmlAttrFields2).find("element").each(function (index, e) {
            attributeFieldsPointGeom.push(e);
        });

        // Example gfiAttributes
        gfiAttributes = {
            "name": "Name",
            "vorhaben": "Vorhaben",
            "anfragedatum": "Anfragedatum",
            "bemerkung": "Bemerkung",
            "vorgangsnummer": "Vorgangsnummer",
            "testnummer": "Testnummer",
            "istest": "Ist es ein Test?"
        };

        // Create example wfst fields
        wfstFieldsStr.forEach(function (field) {
            newField = field.replace("},", "}");
            wfstFields.push(JSON.parse(newField));
        });
        model.set("wfstFields", wfstFields);

        // Example responses for transactions with the wfst service
        transactionResponseInsert = utilModel.parseXML(utilModel.getFile("resources/testTransactionResponseInsert.xml"));
        transactionResponseDelete = utilModel.parseXML(utilModel.getFile("resources/testTransactionResponseDelete.xml"));
        transactionResponseUpdate = utilModel.parseXML(utilModel.getFile("resources/testTransactionResponseUpdate.xml"));
        transactionFailedResponse = utilModel.parseXML(utilModel.getFile("resources/testTransactionFailedResponse.xml"));
        transactionJqXHR = JSON.parse(transactionJqXHRFile);

        // Example features
        features = utilModel.createTestFeatures("resources/testFeatureWfst.xml");

        // Example layer which is created for adding a new geometry in the application
        drawLayer = new Draw({
            source: new VectorSource(),
            type: "Point",
            geometryName: "geom"
        });
        drawLayer.set("values_", drawAttr);
        model.set("layerIds", []);
        model.set("currentLayerId", "682");
    });

    describe("handleEditDeleteBtn", function () {
        it("should return an Array with the passed configurations for displaying the delete and edit buttons and their captions.", function () {
            const deleteConfig = "TestCaption",
                editConfig = false,
                result = [[true, false], ["TestCaption", "Geometrie bearbeiten"]];

            expect(model.handleEditDeleteButton(deleteConfig, editConfig)).to.deep.equal(result);
        });
        it("should return an Array with the default configutations for displaying the delete and edit buttons and their captions if no configurations was made.", function () {
            const result = [[true, true], ["Geometrie löschen", "Geometrie bearbeiten"]];

            expect(model.handleEditDeleteButton(undefined, undefined)).to.deep.equal(result);
        });
        it("should return an Array with the default configutations for displaying the delete and edit buttons and their captions if the passed configuration is null.", function () {
            const deleteConfig = null,
                editConfig = null,
                result = [[true, true], ["Geometrie löschen", "Geometrie bearbeiten"]];

            expect(model.handleEditDeleteButton(deleteConfig, editConfig)).to.deep.equal(result);
        });
    });
    describe("checkLayerConfig", function () {
        it("should return false, if the passed active layer is configured correct.", function () {
            const testWFSTModel = new Backbone.Model({
                "url": "http://test.org/test",
                "version": "1.1.0",
                "featureType": "wfstTest",
                "featureNS": "http://namespace.org/test",
                "featurePrefix": "ab",
                "gfiAttributes": "showAll"
            });

            expect(model.checkLayerConfig(testWFSTModel)).to.be.false;
        });
        it("should return true, if no layer was passed.", function () {
            expect(model.checkLayerConfig()).to.be.true;
        });
        it("should return true, if the passed active layer is undefined.", function () {
            const testWFSTModel = undefined;

            expect(model.checkLayerConfig(testWFSTModel)).to.be.true;
        });
        it("should return true, if the passed layer is configured incorrectly.", function () {
            const testWFSTModel = new Backbone.Model({
                "url": "http://test.org/test",
                "version": "1.1.0",
                "featureType": "wfstTest",
                "featureNS": "http://namespace.org/test",
                "gfiAttributes": "showAll"
            });

            expect(model.checkLayerConfig(testWFSTModel)).to.be.true;
        });
    });
    describe("handleAvailableLayers", function () {
        it("should return an empty Array if no layerIds were given", function () {
            const ids = [],
                initialAlertCases = ["AvailableLayers"];

            model.set("initialAlertCases", ["AvailableLayers"]);
            expect(model.handleAvailableLayers(ids, initialAlertCases)).to.be.empty;
        });
        it("should return the error case 'AvailableLayers' if no layerIds were configured.", function () {
            const ids = [],
                initialAlertCases = [],
                alertCase = "AvailableLayers";

            model.set("initialAlertCases", []);
            model.handleAvailableLayers(ids, initialAlertCases);
            expect(model.get("initialAlertCases")).to.include(alertCase);
        });
        it("should return the error case 'AvailableLayers' only once if no layerIds were configured and the error case is already existing in the initialAlertCase parameter.", function () {
            const ids = [],
                initialAlertCases = ["AvailableLayers"],
                result = ["AvailableLayers"];

            model.set("initialAlertCases", ["AvailableLayers"]);
            model.handleAvailableLayers(ids, initialAlertCases);
            expect(model.get("initialAlertCases")).to.deep.equal(result);
        });
        it("should return an empty Array if the passed layerIds are undefined.", function () {
            const initialAlertCases = ["AvailableLayers"];

            model.set("initialAlertCases", ["AvailableLayers"]);
            expect(model.handleAvailableLayers(undefined, initialAlertCases)).to.be.empty;
        });
        it("should return the configured LayerIds", function () {
            const ids = ["123", "456", "789"],
                initialAlertCases = [],
                result = ["123", "456", "789"];

            model.set("initialAlertCases", []);
            expect(model.handleAvailableLayers(ids, initialAlertCases)).to.deep.equal(result);
        });
    });
    describe("checkActiveLayers", function () {
        it("should return the passed object, if all passed active layers are configured correct", function () {
            const activeLayers = {
                    "682": "Kindertagesstaetten",
                    "1731": "Krankenhäuser Hamburg"
                },
                incorrectConfigLayers = [];

            expect(model.checkActiveLayers(activeLayers, incorrectConfigLayers)).to.deep.equal(activeLayers);
        });
        it("should return an empty object, if no active layer was passed", function () {
            const activeLayers = {},
                incorrectConfigLayers = [];

            expect(model.checkActiveLayers(activeLayers, incorrectConfigLayers)).to.be.empty;
        });
        it("should return an empty object, if all passed active layers are undefined", function () {
            const incorrectConfigLayers = [];

            expect(model.checkActiveLayers(undefined, incorrectConfigLayers)).to.be.empty;
        });
        it("should return an empty object, if all passed active layers are configured incorrect", function () {
            const activeLayers = {},
                incorrectConfigLayers = ["682", "1731"];

            activeLayers["682"] = "Kindertagesstaetten";
            activeLayers["1731"] = "Krankenhäuser Hamburg";

            expect(model.checkActiveLayers(activeLayers, incorrectConfigLayers)).to.be.empty;
        });
    });
    describe("getSelectedLayer", function () {
        it("should return null if the passed activeLayer Object is empty", function () {
            const activeLayers = {},
                firstId = null;

            expect(model.getSelectedLayer(activeLayers)).to.deep.equal(firstId);
        });
        it("should return null if the passed activeLayer Object is null", function () {
            const activeLayers = null,
                firstId = null;

            expect(model.getSelectedLayer(activeLayers)).to.deep.equal(firstId);
        });
        it("should return the id of the first layer in the passed activeLayer Object if it contains at least one active layer", function () {
            const activeLayers = {},
                firstId = "682";

            activeLayers[682] = "Kindertagesstaetten";
            activeLayers[1731] = "Krankenhäuser Hamburg";
            expect(model.getSelectedLayer(activeLayers)).to.deep.equal(firstId);
        });
    });
    describe("getAlertMessage", function () {
        it("should return the appropriate error message for the passed error case", function () {
            const alertCase = "decimalError",
                errorMessage = "Bitte geben Sie nur Dezimalzahlen ein! Das Dezimal-Trennzeichen ist ein Komma.";

            expect(model.getAlertMessage(alertCase)).is.equal(errorMessage);
        });
        it("should return an empty String if the passed error Case is empty", function () {
            const alertCase = "",
                errorMessage = "";

            expect(model.getAlertMessage(alertCase)).is.equal(errorMessage);
        });
        it("should return an empty String if the passed error Case is undefined or null", function () {
            const errorMessage = "";

            expect(model.getAlertMessage(undefined)).is.equal(errorMessage);
        });
    });
    describe("getLayerParams", function () {
        it("should return an empty object, if the passed layer is empty", function () {
            const wfsLayer = {};

            expect(model.getLayerParams(wfsLayer)).to.be.empty;
        });
        it("should return an empty object, if the passed layer is undefined", function () {

            expect(model.getLayerParams(undefined)).to.be.empty;
        });
        it("should return the respective attributes of the passed layer", function () {
            const testWFSTModel = new Backbone.Model({
                    "url": "http://test.org/test",
                    "version": "1.1.0",
                    "featureType": "wfstTest",
                    "featureNS": "http://namespace.org/test",
                    "featurePrefix": "ab",
                    "gfiAttributes": "showAll"
                }),
                result = {
                    url: "http://test.org/test",
                    version: "1.1.0",
                    featureType: "wfstTest",
                    featureNS: "http://namespace.org/test",
                    featurePrefix: "ab",
                    gfiAttributes: "showAll"
                };

            expect(model.getLayerParams(testWFSTModel)).to.deep.equal(result);
        });
    });
    describe("parseResponse", function () {
        it("should return the attributes of a feature type, if the passed DescribeFeatureType response is in a non-hierarchical XML Schema.", function () {
            const featureTypename = "wfstest",
                response = model.parseResponse(dftNonHierXml, featureTypename),
                result = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                responseNames = [];
            let i = 0;

            while (i < response.length) {
                responseNames.push($(response[i]).attr("name"));
                i++;
            }
            expect(responseNames).to.deep.equal(result);
        });
        it("should return the attributes of a feature type, if the passed DescribeFeatureType response is in a non-hierarchical XML Schema and uses a prefix.", function () {
            const featureTypename = "wfstest",
                response = model.parseResponse(dftNonHierXmlPrefix, featureTypename),
                result = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                responseNames = [];
            let i = 0;

            while (i < response.length) {
                responseNames.push($(response[i]).attr("name"));
                i++;
            }
            expect(responseNames).to.deep.equal(result);
        });
        it("should return the attributes of a feature type, if the passed DescribeFeatureType response is in a hierarchical XML Schema.", function () {
            const featureTypename = "wfstest",
                response = model.parseResponse(dftHierXml, featureTypename),
                result = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                responseNames = [];
            let i = 0;

            while (i < response.length) {
                responseNames.push($(response[i]).attr("name"));
                i++;
            }
            expect(responseNames).to.deep.equal(result);
        });
        it("should return the attributes of a feature type, if the passed DescribeFeatureType response is in a hierarchical XML Schema and uses a prefix.", function () {
            const featureTypename = "wfstest",
                response = model.parseResponse(dftHierXmlPrefix, featureTypename),
                result = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                responseNames = [];
            let i = 0;

            while (i < response.length) {
                responseNames.push($(response[i]).attr("name"));
                i++;
            }
            expect(responseNames).to.deep.equal(result);
        });
        it("should return an empty array, if the passed DescribeFeatureType response is undefined.", function () {
            const featureTypename = "wfstest";

            expect(model.parseResponse(undefined, featureTypename)).to.be.empty;
        });
    });
    describe("filterInputFields", function () {
        it("should return an array with all attributes of the feature type, if the value of gfiAttributes is 'showAll'.", function () {
            const gfiAttributesS = "showAll",
                result = [
                    {
                        "field": "name",
                        "caption": "name"
                    },
                    {
                        "field": "vorhaben",
                        "caption": "vorhaben"
                    },
                    {
                        "field": "anfragedatum",
                        "caption": "anfragedatum"
                    },
                    {
                        "field": "bemerkung",
                        "caption": "bemerkung"
                    },
                    {
                        "field": "vorgangsnummer",
                        "caption": "vorgangsnummer"
                    },
                    {
                        "field": "testnummer",
                        "caption": "testnummer"
                    },
                    {
                        "field": "istest",
                        "caption": "istest"
                    }
                ];

            expect(model.filterInputFields(gfiAttributesS, attributeFields)).to.deep.equal(result);
        });
        it("should return an empty array, if the value of gfiAttributes is 'ignore'.", function () {
            const gfiAttributesI = "ignore";

            expect(model.filterInputFields(gfiAttributesI, attributeFields)).to.be.empty;
        });
        it("should return an empty array, if gfiAttributes is undefined.", function () {
            expect(model.filterInputFields(undefined, attributeFields)).to.be.empty;
        });
        it("should return an array with the attributes of the feature type that are contained in gfiAttributes.", function () {
            const result = [
                {
                    "field": "name",
                    "caption": "Name"
                },
                {
                    "field": "vorhaben",
                    "caption": "Vorhaben"
                },
                {
                    "field": "anfragedatum",
                    "caption": "Anfragedatum"
                },
                {
                    "field": "bemerkung",
                    "caption": "Bemerkung"
                },
                {
                    "field": "vorgangsnummer",
                    "caption": "Vorgangsnummer"
                },
                {
                    "field": "testnummer",
                    "caption": "Testnummer"
                },
                {
                    "field": "istest",
                    "caption": "Ist es ein Test?"
                }
            ];

            expect(model.filterInputFields(gfiAttributes, attributeFields)).to.deep.equal(result);
        });
    });
    describe("getGeometryName", function () {
        it("should return null, if the passed attributeFields are empty.", function () {
            const attributeFieldsEmpty = [];

            expect(model.getGeometryName(attributeFieldsEmpty)).to.be.null;
        });
        it("should return null, if the passed attributeFields are undefined.", function () {
            expect(model.getGeometryName(undefined)).to.be.null;
        });
        it("should return the name of the geometry, if the passed parameter contains the geometry attribute.", function () {
            const geometry = "geom";

            expect(model.getGeometryName(attributeFields)).to.deep.equal(geometry);
        });
    });
    describe("getTypeOfInputFields", function () {
        it("should return an Object with inputfield type and the type of each feature attribute in the passed object.", function () {
            const result = {
                "name": {"fieldType": "text", "type": "string"},
                "vorhaben": {"fieldType": "text", "type": "string"},
                "anfragedatum": {"fieldType": "date", "type": "date"},
                "bemerkung": {"fieldType": "text", "type": "string"},
                "vorgangsnummer": {"fieldType": "text", "type": "integer"},
                "testnummer": {"fieldType": "text", "type": "decimal"},
                "istest": {"fieldType": "checkbox", "type": "boolean"}
            };

            expect(model.getTypeOfInputFields(attributeFields)).to.deep.equal(result);
        });
        it("should return an empty Object if the passed parameter attributeFields is empty.", function () {
            const attributeFieldsEmpty = [];

            expect(model.getTypeOfInputFields(attributeFieldsEmpty)).to.be.empty;
        });
        it("should return an empty Object if the passed parameter attributeFields is undefined.", function () {
            expect(model.getTypeOfInputFields(undefined)).to.be.empty;
        });
    });
    describe("getMandatoryFields", function () {
        it("should return an array with true for the attributes where 'minOccurs' is not existing or 'minOccurs' is equal to 1 and with false for the attributes where 'minOccurs' is equal to 0.", function () {
            const result = [];

            result.geom = true;
            result.name = true;
            result.vorhaben = true;
            result.anfragedatum = true;
            result.bemerkung = false;
            result.vorgangsnummer = true;
            result.testnummer = false;
            result.istest = false;

            expect(model.getMandatoryFields(attributeFields)).to.deep.equal(result);
        });
        it("should return an empty array, if the passed object is empty.", function () {
            const attributeFieldsEmpty = [];

            expect(model.getMandatoryFields(attributeFieldsEmpty)).to.be.empty;
        });
    });
    describe("handleInputFields", function () {
        it("should return an empty array, if one of the passed objects is undefined.", function () {
            const fields = [
                    {
                        "field": "name",
                        "caption": "Name"
                    },
                    {
                        "field": "vorhaben",
                        "caption": "Vorhaben"
                    },
                    {
                        "field": "anfragedatum",
                        "caption": "Anfragedatum"
                    },
                    {
                        "field": "bemerkung",
                        "caption": "Bemerkung"
                    },
                    {
                        "field": "vorgangsnummer",
                        "caption": "Vorgangsnummer"
                    },
                    {
                        "field": "testnummer",
                        "caption": "Testnummer"
                    },
                    {
                        "field": "istest",
                        "caption": "Ist es ein Test?"
                    }
                ],
                type = {
                    "name": {"fieldType": "text", "type": "string"},
                    "vorhaben": {"fieldType": "text", "type": "string"},
                    "anfragedatum": {"fieldType": "date", "type": "date"},
                    "bemerkung": {"fieldType": "text", "type": "string"},
                    "vorgangsnummer": {"fieldType": "text", "type": "integer"},
                    "testnummer": {"fieldType": "text", "type": "decimal"},
                    "istest": {"fieldType": "checkbox", "type": "boolean"}
                };

            expect(model.handleInputFields(fields, type, undefined)).to.be.empty;
        });
        it("should return an array with default values for the attribute type and the mandatory flag, if the passed type or the mandatory object do not contain a value for an attribute.", function () {
            const fields = [
                    {
                        "field": "name",
                        "caption": "Name"
                    },
                    {
                        "field": "vorhaben",
                        "caption": "Vorhaben"
                    },
                    {
                        "field": "anfragedatum",
                        "caption": "Anfragedatum"
                    },
                    {
                        "field": "bemerkung",
                        "caption": "Bemerkung"
                    },
                    {
                        "field": "vorgangsnummer",
                        "caption": "Vorgangsnummer"
                    },
                    {
                        "field": "testnummer",
                        "caption": "Testnummer"
                    },
                    {
                        "field": "istest",
                        "caption": "Ist es ein Test?"
                    }
                ],
                type = {
                    "name": {"fieldType": "text", "type": "string"},
                    "anfragedatum": {"fieldType": "date", "type": "date"},
                    "bemerkung": {"fieldType": "text", "type": "string"},
                    "vorgangsnummer": {"fieldType": "text", "type": "integer"},
                    "testnummer": {"fieldType": "text", "type": "decimal"},
                    "istest": {"fieldType": "checkbox", "type": "boolean"}
                },
                mandatory = [];

            mandatory.geom = true;
            mandatory.name = true;
            mandatory.vorhaben = true;
            mandatory.anfragedatum = true;
            mandatory.vorgangsnummer = true;
            mandatory.testnummer = false;
            mandatory.istest = false;

            expect(model.handleInputFields(fields, type, mandatory)).to.deep.equal(wfstFields);
        });
        it("should return an array with all attributes of the feature type, that are specified in gfiAttributes and the attribute type and if the attribute is mandatory or not.", function () {
            const fields = [
                    {
                        "field": "name",
                        "caption": "Name"
                    },
                    {
                        "field": "vorhaben",
                        "caption": "Vorhaben"
                    },
                    {
                        "field": "anfragedatum",
                        "caption": "Anfragedatum"
                    },
                    {
                        "field": "bemerkung",
                        "caption": "Bemerkung"
                    },
                    {
                        "field": "vorgangsnummer",
                        "caption": "Vorgangsnummer"
                    },
                    {
                        "field": "testnummer",
                        "caption": "Testnummer"
                    },
                    {
                        "field": "istest",
                        "caption": "Ist es ein Test?"
                    }
                ],
                type = {
                    "name": {"fieldType": "text", "type": "string"},
                    "vorhaben": {"fieldType": "text", "type": "string"},
                    "anfragedatum": {"fieldType": "date", "type": "date"},
                    "bemerkung": {"fieldType": "text", "type": "string"},
                    "vorgangsnummer": {"fieldType": "text", "type": "integer"},
                    "testnummer": {"fieldType": "text", "type": "decimal"},
                    "istest": {"fieldType": "checkbox", "type": "boolean"}
                },
                mandatory = [];

            mandatory.geom = true;
            mandatory.name = true;
            mandatory.vorhaben = true;
            mandatory.anfragedatum = true;
            mandatory.bemerkung = false;
            mandatory.vorgangsnummer = true;
            mandatory.testnummer = false;
            mandatory.istest = false;

            expect(model.handleInputFields(fields, type, mandatory)).to.deep.equal(wfstFields);
        });
    });
    describe("getButtonTitleConfigs", function () {
        it("should return the default captions for all Buttons and the Layer Select if no configuration was made", function () {
            const buttons = [undefined, undefined, undefined],
                btnCaptConfs = ["Punkt erfassen", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"];

            expect(model.getButtonTitleConfigs(undefined, buttons, btnCaptConfs)).to.deep.equal(btnCaptConfs);
        });
        it("should return the new caption for the Layer Select of the model", function () {
            const layerSelect = "Wfs-t Feature Types",
                buttons = [true, false, true],
                btnCaptConfs = ["Punkt-Test", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"],
                result = ["Punkt-Test", "Linie erfassen", "Fläche erfassen", "Wfs-t Feature Types"];

            expect(model.getButtonTitleConfigs(layerSelect, buttons, btnCaptConfs)).to.deep.equal(result);
        });
        it("should return the new caption for the Point Button of the model", function () {
            const buttons = [[{"layerId": "682", "caption": "Baum erfassen", "show": true}], false, true],
                btnCaptConfs = ["Punkt-Test", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"],
                layerId = "682",
                result = ["Baum erfassen", "Linie erfassen", "Fläche erfassen", "aktueller Layer:"];

            expect(model.getButtonTitleConfigs(undefined, buttons, btnCaptConfs, layerId)).to.deep.equal(result);
        });
    });
    describe("getButtonConfig", function () {
        it("should return true for the point button configuration and false for the configuration of the other buttons, if the passed layers geometry is point.", function () {
            const buttons = [
                    [
                        {
                            "layerId": "123",
                            "caption": "Test",
                            "show": true
                        }
                    ],
                    true,
                    [
                        {
                            "layerId": "123",
                            "show": false
                        }
                    ]
                ],
                layerId = "123",
                result = [true, false, false];

            expect(model.getButtonConfig(attributeFieldsPointGeom, layerId, buttons)).to.deep.equal(result);
        });
        it("should return an array with the configurations made for the point, line and area button, if the passed layers geometry is not of a special type.", function () {
            const buttons = [
                    [
                        {
                            "layerId": "123",
                            "caption": "Test",
                            "show": true
                        }
                    ],
                    true,
                    [
                        {
                            "layerId": "123",
                            "show": false
                        }
                    ]
                ],
                layerId = "123",
                result = [true, true, false];

            expect(model.getButtonConfig(attributeFields, layerId, buttons)).to.deep.equal(result);
        });
        it("should return an array with the configurations made for the point, line and area button, if the passed attributeFields are empty and the layers geometry is not of a special type.", function () {
            const attributeFieldsEmpty = [],
                buttons = [
                    [
                        {
                            "layerId": "123",
                            "caption": "Test",
                            "show": true
                        }
                    ],
                    true,
                    [
                        {
                            "layerId": "123",
                            "show": false
                        }
                    ]
                ],
                layerId = "123",
                result = [true, true, false];

            expect(model.getButtonConfig(attributeFieldsEmpty, layerId, buttons)).to.deep.equal(result);
        });
        it("should return an array with the default configurations for the point, line and area button, if the passed layers geometry is not of a special type and no configurations were made.", function () {
            const buttons = [undefined, undefined, undefined],
                layerId = "123",
                result = [true, true, true];

            expect(model.getButtonConfig(attributeFields, layerId, buttons)).to.deep.equal(result);
        });
    });
    describe("getFieldType", function () {
        it("should return the type of the requestet input field", function () {
            const id = "name";

            expect(model.getFieldType(id, wfstFields)).to.deep.equal("string");
        });
        it("should return undefined if the passed wfstFields are empty", function () {
            const wfstFieldsEmpty = [],
                id = "name";

            expect(model.getFieldType(id, wfstFieldsEmpty)).to.be.undefined;
        });
        it("should return undefined if the passed id is undefined or is not included in the wfstFields", function () {
            const id = undefined;

            expect(model.getFieldType(id, wfstFields)).to.be.undefined;
        });
    });
    describe("handleFeatureAttributes", function () {
        it("should set the feature properties from the input fields", function () {
            const featureProperties = {
                    "active": true,
                    "name": "",
                    "geom": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                id = "name",
                inputValue = "Test",
                result = {
                    "active": true,
                    "name": "Test",
                    "geom": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                };

            expect(model.handleFeatureAttributes(featureProperties, id, inputValue)).to.deep.equal(result);
        });
        it("should not set the feature properties from the input fields if the input value is no string or boolean", function () {
            const featureProperties = {
                    "active": true,
                    "name": "",
                    "geom": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                id = "name",
                inputValue = 12;

            expect(model.handleFeatureAttributes(featureProperties, id, inputValue)).to.deep.equal(featureProperties);
        });
        it("should not set the feature properties from the input fields if the passed id is not of type string", function () {
            const featureProperties = {
                    "active": true,
                    "name": "",
                    "geom": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                id = true,
                inputValue = "Test";

            expect(model.handleFeatureAttributes(featureProperties, id, inputValue)).to.deep.equal(featureProperties);
        });
    });
    describe("inheritModelListAttributes", function () {
        it("should return the layer id for the current feature", function () {
            // todo
            // benötigt WFS Layer
        });
        it("should return undefined if the passed feature id is undefined", function () {
            // todo
            // benötigt WFS Layer
        });
        it("should return undefined if the passed array with wfs layers is empty", function () {
            // todo
            // benötigt WFS Layer
        });
    });
    describe("getActionType", function () {
        it("should return 'update' if the current executet transaction is update.", function () {
            const activeButton = "wfst-module-recordButton-save",
                result = "update";

            expect(model.getActionType(features[0], activeButton)).to.deep.equal(result);
        });
        it("should return 'delete' if the current executet transaction is delete.", function () {
            const activeButton = "wfst-module-recordButton-delete",
                result = "delete";

            expect(model.getActionType(features[0], activeButton)).to.deep.equal(result);
        });
        it("should return undefined if the passed feature is empty and the passed active button is the save button.", function () {
            const featureEmpty = {},
                activeButton = "wfst-module-recordButton-save";

            expect(model.getActionType(featureEmpty, activeButton)).to.be.undefined;
        });
        it("should return undefined if the passed active button is undefined.", function () {
            expect(model.getActionType(features[0], undefined)).to.be.undefined;
        });
    });
    describe("proofConditions", function () {
        it("should return true if all mandatory fields are filled and a geometry was created.", function () {
            const geometryName = "geom";

            expect(model.proofConditions(features[0], wfstFields, geometryName)).to.be.true;
        });
        it("should return false if a mandatory field is not filled but a geometry was created.", function () {
            const geometryName = "geom";

            expect(model.proofConditions(features[2], wfstFields, geometryName)).to.be.false;
        });
        it("should return false if all mandatory fields are filled, but no geometry was created.", function () {
            const geometryName = "geom";

            expect(model.proofConditions(drawLayer, wfstFields, geometryName)).to.be.false;
        });
        it("should return false if the passed feature is empty.", function () {
            const featureEmpty = {},
                geometryName = "geom";

            expect(model.proofConditions(featureEmpty, wfstFields, geometryName)).to.be.false;
        });
        it("should return false if the passed wfstFields are empty.", function () {
            const wfstFieldsEmpty = {},
                geometryName = "geom";

            expect(model.proofConditions(features[0], wfstFieldsEmpty, geometryName)).to.be.false;
        });
    });
    describe("handleFeatureProperties", function () {
        it("should return the feature with correct ordered properties, if the passed feature has missing properties.", function () {
            const featureProperties = {
                    "name": "Test handleFeatureProperties 1",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1.1",
                    "istest": "true"
                },
                orderedAttributes = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                correctedFeature = model.handleFeatureProperties(featureProperties, features[11], orderedAttributes),
                result = {
                    "name": "Test handleFeatureProperties 1",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1.1",
                    "istest": "true"
                };

            delete correctedFeature.unset("geom");
            expect(correctedFeature.getProperties()).to.deep.equal(result);
        });
        it("should return the feature with correct ordered properties, if some of the passed feature properties do not have values", function () {
            const featureProperties = {
                    "name": "Test handleFeatureProperties 2",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "",
                    "vorgangsnummer": "3",
                    "testnummer": "",
                    "istest": "true"
                },
                orderedAttributes = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                correctedFeature = model.handleFeatureProperties(featureProperties, features[12], orderedAttributes),
                result = {
                    "name": "Test handleFeatureProperties 2",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "",
                    "vorgangsnummer": "3",
                    "testnummer": "",
                    "istest": "true"
                };

            delete correctedFeature.unset("geom");
            expect(correctedFeature.getProperties()).to.deep.equal(result);
        });
        it("should return the passed feature, if the passed featureProperties are empty.", function () {
            const featureProperties = {},
                orderedAttributes = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"],
                correctedFeature = model.handleFeatureProperties(featureProperties, features[13], orderedAttributes),
                result = {
                    "name": "Test handleFeatureProperties 3",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-27",
                    "vorgangsnummer": "1",
                    "testnummer": "1.1",
                    "istest": "true"
                };

            delete correctedFeature.unset("geom");
            expect(correctedFeature.getProperties()).to.deep.equal(result);
        });
        it("sould return an empty feature if the passed feature is empty.", function () {
            const featureEmpty = {},
                featureProperties = {
                    "name": "Test handleFeatureProperties 4",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "test",
                    "vorgangsnummer": "3",
                    "testnummer": "1.1",
                    "istest": "true"
                },
                orderedAttributes = ["geom", "name", "vorhaben", "anfragedatum", "bemerkung", "vorgangsnummer", "testnummer", "istest"];

            expect(model.handleFeatureProperties(featureProperties, featureEmpty, orderedAttributes)).to.be.empty;
        });
    });
    describe("handleFlawedAttributes", function () {
        it("should return the passed feature without incorrect attributes.", function () {
            const flawedFeature = model.handleFlawedAttributes(features[3], wfstFields),
                correctedFeatureAttributes = {
                    "name": "Test handleFlawedAttributes",
                    "vorhaben": "Testen",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1.1",
                    "istest": "true"
                };

            delete flawedFeature.values_.geom;
            expect(flawedFeature.values_).to.deep.equal(correctedFeatureAttributes);
        });
        it("should return the feature with false values for not checked checkboxes.", function () {
            const flawedFeature = model.handleFlawedAttributes(features[4], wfstFields),
                correctedFeatureAttributes = {
                    "name": "Test handleFlawedAttributes2",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1.1",
                    "istest": false
                };

            delete flawedFeature.values_.geom;
            expect(flawedFeature.values_).to.deep.equal(correctedFeatureAttributes);
        });
        it("should return the passed feature, if the passed wfstFields are empty.", function () {
            const wfstFieldsEmpty = [];

            expect(model.handleFlawedAttributes(features[0], wfstFieldsEmpty)).to.deep.equal(features[0]);
        });
        it("should return an empty object, if the passed feature is empty.", function () {
            const featureEmpty = {};

            expect(model.handleFlawedAttributes(featureEmpty, wfstFields)).to.be.empty;
        });
    });
    describe("handleDecimalSeperator", function () {
        it("should return the feature with the ',' decimal seperator for the display mode.", function () {
            const mode = "display",
                result = {
                    "name": "Max Mustermann",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-01-28",
                    "bemerkung": "Dies ist ein Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1,3",
                    "istest": "false"
                },
                displayFeature = model.handleDecimalSeperator(features[0].values_, mode, wfstFields);

            delete displayFeature.geom;
            expect(displayFeature).to.deep.equal(result);
        });
        it("should return the feature with the '.' decimal seperator for the transaction mode.", function () {
            const mode = "transaction",
                result = {
                    "name": "Max Mustermann",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-01-28",
                    "bemerkung": "Dies ist ein Punkt",
                    "vorgangsnummer": "3",
                    "testnummer": "1.3",
                    "istest": "false"
                },
                displayFeature = model.handleDecimalSeperator(features[0], mode, wfstFields);

            delete displayFeature.values_.geom;
            expect(displayFeature.values_).to.deep.equal(result);
        });
        it("should return the passed feature, if the passed wfstFields are empty.", function () {
            const mode = "display",
                wfstFieldsEmpty = [];

            expect(model.handleDecimalSeperator(features[0], mode, wfstFieldsEmpty)).to.deep.equal(features[0]);
        });
        it("should return the passed feature, if the passed mode is undefined.", function () {
            const wfstFieldsEmpty = [];

            expect(model.handleDecimalSeperator(features[0], undefined, wfstFieldsEmpty)).to.deep.equal(features[0]);
        });
        it("should return an empty Object, if the passed feature is empty.", function () {
            const featureEmpty = {},
                mode = "display";

            expect(model.handleDecimalSeperator(featureEmpty, mode, wfstFields)).to.be.empty;
        });
    });
    describe("handleEmptyAttributes", function () {
        it("should return a feature without empty attributes, if the passed feature has empty attributes and the transaction mode is insert.", function () {
            features[5].setProperties({"bemerkung": "", "testnummer": ""});
            const result = {
                    "name": "Test handleEmptyAttributes 1",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-27",
                    "vorgangsnummer": "1",
                    "istest": "true"
                },
                mode = "insert",
                editedFeature = model.handleEmptyAttributes(features[5], mode);

            delete editedFeature.values_.geom;
            expect(editedFeature.values_).to.deep.equal(result);
        });
        it("should return a feature with null attributes, if the passed feature has empty attributes and the transaction mode is update.", function () {
            features[6].setProperties({"bemerkung": "", "testnummer": ""});
            const result = {
                    "name": "Test handleEmptyAttributes 2",
                    "vorhaben": "Testen",
                    "anfragedatum": "2020-02-27",
                    "bemerkung": null,
                    "vorgangsnummer": "1",
                    "testnummer": null,
                    "istest": "true"
                },
                mode = "update",
                editedFeature = model.handleEmptyAttributes(features[6], mode);

            delete editedFeature.values_.geom;
            expect(editedFeature.values_).to.deep.equal(result);
        });
        it("should return the passed feature, if it has no empty attributes.", function () {
            expect(model.handleEmptyAttributes(features[0])).to.deep.equal(features[0]);
        });
        it("should return an empty object, if the passed feature is empty.", function () {
            const featureEmpty = {};

            expect(model.handleEmptyAttributes(featureEmpty)).to.be.empty;
        });
    });
    describe("handleMissingFeatureProperties", function () {
        it("should return a feature with all missing properties, if the passed feature has missing properties.", function () {
            const geometry = "geom",
                mode = "drawProperties",
                properties = {
                    "active": true,
                    "name": "Test handleMissingFeatureProperties",
                    "geom": "",
                    "vorhaben": "test",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": 123,
                    "testnummer": 1.1,
                    "istest": true
                },
                result = {
                    "name": "Test handleMissingFeatureProperties",
                    "vorhaben": "test",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": 123,
                    "testnummer": 1.1,
                    "istest": true
                },
                editedFeature = model.handleMissingFeatureProperties(features[7], geometry, properties, mode);

            delete editedFeature.values_.geom;
            expect(editedFeature.values_).to.deep.equal(result);
        });
        it("should return an empty object, if the passed feature is empty.", function () {
            const featureEmpty = {},
                geometry = "geom",
                properties = {
                    "active": true,
                    "name": "Test handleMissingFeatureProperties",
                    "geom": "",
                    "vorhaben": "test",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": 123,
                    "testnummer": 1.1,
                    "istest": true
                },
                mode = "drawProperties";

            expect(model.handleMissingFeatureProperties(featureEmpty, geometry, properties, mode)).to.be.empty;
        });
        it("should return a feature with empty property values, if the passed mode is undefined.", function () {
            const geometry = "geom",
                properties = {
                    "active": true,
                    "name": "Test handleMissingFeatureProperties",
                    "geom": "",
                    "vorhaben": "test",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": 123,
                    "testnummer": 1.1,
                    "istest": true
                },
                result = {
                    "name": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                editedFeature = model.handleMissingFeatureProperties(features[8], geometry, properties, undefined);

            delete editedFeature.values_.geom;
            expect(editedFeature.values_).to.deep.equal(result);
        });
        it("should return a feature with empty property values and an empty property geom, if the passed mode is 'draw'.", function () {
            const geometry = "geom",
                mode = "draw",
                properties = {
                    "active": true,
                    "name": "Test handleMissingFeatureProperties",
                    "geom": "",
                    "vorhaben": "test",
                    "anfragedatum": "2020-02-18",
                    "bemerkung": "Ein Test Punkt",
                    "vorgangsnummer": 123,
                    "testnummer": 1.1,
                    "istest": true
                },
                result = {
                    "geom": "",
                    "name": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                editedFeature = model.handleMissingFeatureProperties(features[9], geometry, properties, mode);

            expect(editedFeature.values_).to.deep.equal(result);
        });
        it("should return a feature with empty property values, if the passed properties are empty.", function () {
            const geometry = "geom",
                properties = {},
                result = {
                    "name": "",
                    "vorhaben": "",
                    "anfragedatum": "",
                    "bemerkung": "",
                    "vorgangsnummer": "",
                    "testnummer": "",
                    "istest": ""
                },
                editedFeature = model.handleMissingFeatureProperties(features[10], geometry, properties, undefined);

            delete editedFeature.values_.geom;
            expect(editedFeature.values_).to.deep.equal(result);
        });
    });
    describe("transactionWFS", function () {
        it("should return a xml string for an insert transaction, if the passed parameter are correct", function () {
            const mode = "insert",
                writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Insert><wfstlgv xmlns=\"http://cite.opengeospatial.org/gmlsf\" fid=\"SF_AGGREGATEGEOFEATURE_107\"><geom><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></geom><name>Test transactionWFS</name><vorhaben>Testen</vorhaben><anfragedatum>2020-01-29</anfragedatum>" +
                "<bemerkung>Dies ist ein Punkt</bemerkung><vorgangsnummer>2</vorgangsnummer><testnummer>1.2</testnummer><istest>false</istest></wfstlgv></Insert></Transaction>";

            expect(model.transactionWFS(mode, features[1], writeOptions)).to.deep.equal(xmlString);
        });
        it("should return a xml string for a delete transaction, if the passed parameter are correct", function () {
            const mode = "delete",
                writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Delete typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/>" +
                "</Filter></Delete></Transaction>";

            expect(model.transactionWFS(mode, features[1], writeOptions)).to.deep.equal(xmlString);
        });
        it("should return a xml string for an update transaction, if the passed parameter are correct", function () {
            const mode = "update",
                writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>";

            expect(model.transactionWFS(mode, features[1], writeOptions)).to.deep.equal(xmlString);
        });
        it("should return undefined if the passed parameter mode is undefined", function () {
            const writeOptions = {
                featureNS: "http://cite.opengeospatial.org/gmlsf",
                featurePrefix: "sf",
                featureType: "wfstlgv",
                srsName: "EPSG:25832"
            };

            expect(model.transactionWFS(undefined, features[1], writeOptions)).to.be.undefined;
        });
        it("should return undefined if the passed feature is empty.", function () {
            const featureEmpty = {},
                mode = "insert";

            expect(model.transactionWFS(mode, featureEmpty)).to.be.undefined;
        });
    });
    describe("handleIEXml", function () {
        it("should return the passed XML string, if it contains the namespace in the update tag.", function () {
            const writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                mode = "update",
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>";

            expect(model.handleIEXml(xmlString, writeOptions, mode)).to.deep.equal(xmlString);
        });
        it("should return an XML string containing the namespace in the update tag if the passed XML string did not contain it.", function () {
            const writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                mode = "update",
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>",
                result = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>";

            expect(model.handleIEXml(xmlString, writeOptions, mode)).to.deep.equal(result);
        });
        it("should return the passed XML string, if the passed mode is undefined", function () {
            const writeOptions = {
                    featureNS: "http://cite.opengeospatial.org/gmlsf",
                    featurePrefix: "sf",
                    featureType: "wfstlgv",
                    srsName: "EPSG:25832"
                },
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>";

            expect(model.handleIEXml(xmlString, writeOptions, undefined)).to.deep.equal(xmlString);
        });
        it("should return the passed XML string, if it passed writeOptions are empty.", function () {
            const writeOptions = {},
                mode = "update",
                xmlString = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">" +
                "<Update typeName=\"sf:wfstlgv\" xmlns:sf=\"http://cite.opengeospatial.org/gmlsf\"><Property><Name>sf:geom</Name><Value><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:25832\">" +
                "<pos srsDimension=\"2\">566776.881 5936145.508</pos></Point></Value></Property><Property><Name>sf:name</Name><Value>Test transactionWFS</Value></Property><Property><Name>sf:vorhaben</Name><Value>Testen</Value>" +
                "</Property><Property><Name>sf:anfragedatum</Name><Value>2020-01-29</Value></Property><Property><Name>sf:bemerkung</Name><Value>Dies ist ein Punkt</Value></Property><Property>" +
                "<Name>sf:vorgangsnummer</Name><Value>2</Value></Property><Property><Name>sf:testnummer</Name><Value>1.2</Value></Property><Property><Name>sf:istest</Name><Value>false</Value></Property>" +
                "<Filter xmlns=\"http://www.opengis.net/ogc\"><FeatureId fid=\"SF_AGGREGATEGEOFEATURE_107\"/></Filter></Update></Transaction>";

            expect(model.handleIEXml(xmlString, writeOptions, mode)).to.deep.equal(xmlString);
        });
    });
    describe("proofForCorrectTransact", function () {
        it("should return true if the passed response includes a correct insert transaction.", function () {
            const actionType = "insert";

            expect(model.proofForCorrectTransact(transactionResponseInsert, actionType)).to.be.true;
        });
        it("should return true if the passed response includes a correct delete transaction.", function () {
            const actionType = "delete";

            expect(model.proofForCorrectTransact(transactionResponseDelete, actionType)).to.be.true;
        });
        it("should return true if the passed response includes a correct update transaction.", function () {
            const actionType = "update";

            expect(model.proofForCorrectTransact(transactionResponseUpdate, actionType)).to.be.true;
        });
        it("should return false if the passed response does not includes a correct transaction.", function () {
            const actionType = "insert";

            expect(model.proofForCorrectTransact(transactionFailedResponse, actionType)).to.be.false;
        });
        it("should return false if the passed actionType is undefined", function () {
            expect(model.proofForCorrectTransact(transactionResponseInsert, undefined)).to.be.false;
        });
        it("should return false if the passed response is an empty object", function () {
            const actionType = "insert",
                response = {};

            expect(model.proofForCorrectTransact(response, actionType)).to.be.false;
        });
    });
    describe("getExceptionText", function () {
        it("should return the exception text from the passed response", function () {
            const result = "No service with identifier 'wfstxxxy' available.";

            expect(model.getExceptionText(transactionJqXHR)).to.deep.equal(result);
        });
        it("should return undefined if the passed response is empty", function () {
            expect(model.getExceptionText(undefined)).to.be.undefined;
        });
    });
    describe("getSubstring", function () {
        it("should return a substring of a passed string", function () {
            const exception = "This is a test and <Exception>here comes the substring</Exception>",
                seperator = ["Exception", ">", "</"],
                result = "here comes the substring";

            expect(model.getSubstring(exception, seperator)).to.deep.equal(result);
        });
        it("should return undefined if the passed string is undefined", function () {
            const seperator = ["Exception", ">", "</"];

            expect(model.getSubstring(undefined, seperator)).to.be.undefined;
        });
        it("should return undefined if no seperators are passed", function () {
            const exception = "This is a test and <Exception>here comes the exception string</Exception>";

            expect(model.getSubstring(exception, undefined)).to.be.undefined;
        });
    });
});
