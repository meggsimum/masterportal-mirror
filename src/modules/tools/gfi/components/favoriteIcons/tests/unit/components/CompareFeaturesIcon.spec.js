import sinon from "sinon";
import {expect} from "chai";
import {config, shallowMount} from "@vue/test-utils";
import CompareFeatureIcon from "../../../components/CompareFeatureIcon.vue";

config.mocks.$t = key => key;

describe("src/modules/tools/gfi/favoriteIcons/components/CompareFeatureIcon.vue", () => {
    describe("featureIsOnCompareList = false and componentExists = true", () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(CompareFeatureIcon, {
                propsData: {
                    feature: {
                        getId: () => "feature1",
                        getLayerId: () => "1234",
                        getTitle: () => "TestTitle",
                        getAttributesToShow: () => "TestAttributes",
                        getMappedProperties: () => "TestProperties"
                    }
                },
                methods: {
                    componentExists: () => sinon.fake.returns(true)
                },
                computed: {
                    featureIsOnCompareList: sinon.fake.returns(false),
                    mapMode: sinon.fake.returns("2D")
                }
            });
        });
        afterEach(sinon.restore);

        it("should draw a star if the compareFeatures is configured", () => {
            expect(wrapper.find("span").exists()).to.be.true;
        });
        it("should render empty star button if feature is already on compare list", () => {
            expect(wrapper.find("span > i").classes("bi-star")).to.be.true;
            expect(wrapper.find("span > i").classes("bi-star-fill")).to.be.false;
            expect(wrapper.find("span").attributes().title).equals("modules.tools.gfi.favoriteIcons.compareFeatureIcon.toCompareList");
        });
    });

    describe("featureIsOnCompareList = true  and componentExists = true", () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(CompareFeatureIcon, {
                propsData: {
                    feature: {
                        getId: () => "feature1",
                        getLayerId: () => "1234",
                        getTitle: () => "TestTitle",
                        getAttributesToShow: () => "TestAttributes",
                        getMappedProperties: () => "TestProperties"
                    }
                },
                methods: {
                    componentExists: () => true
                },
                computed: {
                    featureIsOnCompareList: sinon.fake.returns(true),
                    mapMode: sinon.fake.returns("2D")
                }
            });
        });
        afterEach(sinon.restore);

        it("should render star button if feature is already on compare list", () => {
            expect(wrapper.find("span > i").classes("bi-star")).to.be.false;
            expect(wrapper.find("span > i").classes("bi-star-fill")).to.be.true;
            expect(wrapper.find("span").attributes().title).equals("modules.tools.gfi.favoriteIcons.compareFeatureIcon.fromCompareList");
        });
    });

    describe("featureIsOnCompareList = true  and componentExists = false", () => {
        let wrapper;

        beforeEach(() => {
            wrapper = shallowMount(CompareFeatureIcon, {
                propsData: {
                    feature: {
                        getId: () => "feature1",
                        getLayerId: () => "1234",
                        getTitle: () => "TestTitle",
                        getAttributesToShow: () => "TestAttributes",
                        getMappedProperties: () => "TestProperties"
                    }
                },
                methods: {
                    componentExists: () => false
                },
                computed: {
                    featureIsOnCompareList: sinon.fake.returns(false),
                    mapMode: sinon.fake.returns("2D")
                }
            });
        });
        afterEach(sinon.restore);

        it("should not draw a star if compareFeatures is not configured", () => {
            expect(wrapper.find("span").exists()).to.be.false;
        });
    });
});
