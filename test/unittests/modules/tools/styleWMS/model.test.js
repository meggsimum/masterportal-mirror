import StyleWMS from "@modules/tools/styleWMS/model.js";
import Util from "@modules/core/util.js";
const chai = require("chai");

describe("tools/styleWMS/model", function () {
    let errors;
    const expect = chai.expect;

    before(function () {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    describe("Validation of user input", function () {

        before(function () {

            new Util();

            const styleWMS = new StyleWMS(),
                attributes = {
                    styleClassAttributes: [
                        {
                            startRange: 1,
                            stopRange: 2,
                            color: "someColor"
                        },
                        {
                            startRange: "nan",
                            stopRange: "42",
                            color: "someColor"
                        },
                        {
                            startRange: "43",
                            stopRange: "nan",
                            color: "someColor"
                        },
                        {
                            startRange: "50",
                            stopRange: "60",
                            color: ""
                        },
                        {
                            startRange: "80",
                            stopRange: "70",
                            color: "someColor"
                        },
                        {
                            startRange: "90",
                            stopRange: "100",
                            color: "someColor"
                        },
                        {
                            startRange: "95",
                            stopRange: "105",
                            color: "someColor"
                        }
                    ]
                };

            errors = styleWMS.validate(attributes);
        });

        describe("Error list should include", function () {

            it("NAN value for minimum", function () {
                expect(errors[0].minText).to.be.equal(i18next.t("common:modules.tools.styleWMS.pleaseEnterInteger"));
                expect(errors[0].minIndex).to.be.equal(1);
            });

            it("NAN value for maximum", function () {
                expect(errors[1].maxText).to.be.equal(i18next.t("common:modules.tools.styleWMS.pleaseEnterInteger"));
                expect(errors[1].maxIndex).to.be.equal(2);
            });

            it("missing color", function () {
                expect(errors[2].colorText).to.be.equal(i18next.t("common:modules.tools.styleWMS.pleaseChooseColor"));
                expect(errors[2].colorIndex).to.be.equal(3);
            });

            it("minimum greater than maximum", function () {
                expect(errors[3].rangeText).to.be.equal(i18next.t("common:modules.tools.styleWMS.checkTheValues"));
                expect(errors[3].rangeIndex).to.be.equal(4);
            });

            it("intersecting intervalls", function () {
                expect(errors[4].intersectText).to.be.equal(i18next.t("common:modules.tools.styleWMS.overlappingValueRanges"));
                expect(errors[4].intersectIndex).to.be.equal(6);
                expect(errors[4].prevIndex).to.be.equal(5);
            });
        });

        describe("The error list", function () {

            it("should consist of five items", function () {
                expect(errors.length).to.be.equal(5);
            });
        });
    });

    describe("Creation of a SLD with two classes", function () {
        let $sld,
            styleClassAttributes;

        before(function () {
            let styleWMS = {},
                sld = "";

            const CustomStyleWMS = StyleWMS.extend({

                get: function (value) {


                    switch (value) {
                        case "geomType":
                            return "Polygon";
                        case "model":
                            return {
                                get: function () {
                                    return "0";
                                }
                            };
                        case "styleClassAttributes":
                            return [
                                {
                                    startRange: "22",
                                    stopRange: "23",
                                    color: "someTestColor"
                                },
                                {
                                    startRange: "24",
                                    stopRange: "25",
                                    color: "someOtherTestColor"
                                }
                            ];
                        case "attributeName":
                            return "testAttribute";
                        default:
                            return null;
                    }
                }
            });

            styleWMS = new CustomStyleWMS();
            styleWMS.setNumberOfClasses(2);

            // Assume that the SLD is valid xml. if it is not the before-block will fail after this line.
            sld = $.parseXML(styleWMS.createEsriRootElement());
            $sld = $(sld);
        });

        it("the name of the layer to be styled should meet the expectation", function () {
            expect($sld.find("sld\\:NamedLayer")
                .children("sld\\:Name")
                .text()).to.be.equal("0");
        });

        it("the SLD should hold two rules", function () {
            expect($sld.find("sld\\:NamedLayer")
                .children("sld\\:UserStyle")
                .children("sld\\:FeatureTypeStyle")
                .children("sld\\:Rule")
                .length).to.be.equal(2);
        });

        it("the SLD should deliver rules for given classes", function () {

            if (Array.isArray(styleClassAttributes)) {
                styleClassAttributes.forEach(styleClassAttribute => {

                    // Select rule with expected attributes by removing the rules with other attributes. Expect one rule to remain.
                    /* eslint max-nested-callbacks: ["error", 5]*/

                    const rule = $sld.find("sld\\:NamedLayer")
                        .children("sld\\:UserStyle")
                        .children("sld\\:FeatureTypeStyle")
                        .children("sld\\:Rule")
                        .filter(function () {
                            // keep elements with expected filter constrains (attribute name and ranges) only.
                            return $(this).children("ogc\\:Filter")
                                .children("ogc\\:And")
                                .filter(function () {
                                    return $(this).children("ogc\\:PropertyIsGreaterThanOrEqualTo")
                                        .filter(function () {
                                            return $(this).children("ogc\\:PropertyName")
                                                .text() === "testAttribute";
                                        })
                                        .filter(function () {
                                            return $(this).children("ogc\\:Literal")
                                                .text() === styleClassAttribute.startRange;
                                        })
                                        .length === 1;
                                })
                                .filter(function () {
                                    return $(this).children("ogc\\:PropertyIsLessThanOrEqualTo")
                                        .filter(function () {
                                            return $(this).children("ogc\\:PropertyName")
                                                .text() === "testAttribute";
                                        })
                                        .filter(function () {
                                            return $(this).children("ogc\\:Literal")
                                                .text() === styleClassAttribute.stopRange;
                                        })
                                        .length === 1;
                                }).length === 1;
                        })
                        .filter(function () {
                            // keep elements with expected color only.
                            return $(this).children("sld\\:PolygonSymbolizer")
                                .children("sld\\:Fill")
                                .children("sld\\:CssParameter[name='fill']")
                                .text() === styleClassAttribute.color;
                        });

                    expect(rule.length).to.be.equal(1);
                });
            }
        });
    });

    describe("Request parameter", function () {
        let CustomStyleWMS;

        before(function () {
            CustomStyleWMS = StyleWMS.extend({
                params: {
                    testParam: "yes"
                },

                model: {
                    get: function (value) {
                        if (value === "layer") {
                            return this.layer;
                        }

                        return null;
                    },

                    layer: {
                        getSource: function () {
                            return this.source;
                        },

                        source: {
                            getParams: function () {
                                return this.params;
                            },

                            updateParams: function (parameters) {
                                Object.assign(this.params, parameters);
                            },

                            params: {
                                testParam: "yes"
                            }
                        }
                    }
                },

                isValid: function () {
                    return true;
                },

                createAndGetRootElement: function () {
                    return "<testSLD></testSLD>";
                },

                updateLegend: function () {
                    // dummy function
                },

                get: function (value) {
                    if (value === "model") {
                        return this.model;
                    }

                    return null;
                }

            });
        });

        it("should vanish after reseting the style", function () {

            const styleWMS = new CustomStyleWMS();
            let params = [];

            styleWMS.createSLD();
            styleWMS.removeSLDBody();

            params = styleWMS.get("model").get("layer").getSource().getParams();
            expect(params).to.be.deep.equal({testParam: "yes", SLD_BODY: undefined, STYLES: ""});
        });
    });
});
