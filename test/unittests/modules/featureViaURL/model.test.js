import FeatureViaURL from "@modules/featureViaURL/model";
import {expect} from "chai";
import sinon from "sinon";

describe("featureViaURL", function () {
    const spy = sinon.spy();

    beforeEach(function () {
        sinon.stub(console, "warn").callsFake(spy);
    });
    afterEach(function () {
        sinon.restore();
        spy.resetHistory();
    });
    describe("createGeoJSON", function () {
        const {createGeoJSON} = FeatureViaURL.prototype,
            geometryType = "Point",
            regExp = /\d+/;
        let features = [{coordinates: [10, 53.5], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}],
            geoJSON;

        it("should create a geoJSON Object containing the given features with the given geometryType and the given epsg code", function () {
            const epsg = 25832;

            geoJSON = createGeoJSON(features, geometryType, epsg);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(epsg);
        });
        it("should create a geoJSON containing the given features with the given geometryType and EPSG Code 4326 if no code was given", function () {
            geoJSON = createGeoJSON(features, geometryType, undefined);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(4326);
        });
        it("should trigger an alert if no coordinates were defined for a feature and the feature shouldn't be added to the Object", function () {
            features = [{label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if the coordinates of a feature are not an Array and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: {x: 10, y: 53.5}, label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if the coordinates of a feature is just an empty Array and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: [], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
        it("should trigger an alert if no label was defined for a feature and the feature shouldn't be added to the Object", function () {
            features = [{coordinates: [10, 53.5]}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
    });
    describe("getFeatureIds", function () {
        /**
         * @returns {string} The id of the feature;
         */
        function getId () {
            return this.id;
        }
        const correctId = "42",
            fakeLayer = {
                get: () => correctId,
                getSource: () => {
                    return {
                        getFeatures: () => [{id: "66", getId}, {id: "89", getId}]
                    };
                }
            },
            fakeFunction = sinon.fake.returns({
                getArray: () => [fakeLayer]
            }),
            {getFeatureIds} = FeatureViaURL.prototype;

        beforeEach(function () {
            sinon.stub(Radio, "request").callsFake(fakeFunction);
        });
        it("should return an array of feature Ids if the layer was found", function () {
            expect(getFeatureIds(correctId)).to.eql(["66", "89"]);
        });
        it("should log an error on the console if no layer was found with the specified layerId and return an empty array", function () {
            const wrongId = "402";

            expect(getFeatureIds(wrongId)).to.eql([]);
            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.layerNotFound")]);
        });
        it("should log an error on the console if no layerId was given to the function and return an empty array", function () {
            expect(getFeatureIds()).to.eql([]);
            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:modules.featureViaURL.messages.layerNotFound")]);
        });
    });
});
