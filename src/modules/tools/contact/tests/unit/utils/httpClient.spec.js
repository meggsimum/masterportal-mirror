import sinon from "sinon";
import axios from "axios";

import httpClient from "../../../utils/httpClient";

describe("tools/contact/utils/httpClient", function () {
    describe("httpClient", function () {
        beforeEach(() => {
            sinon.stub(Radio, "trigger");
            sinon.stub(console, "error").callsFake(sinon.stub());
        });

        afterEach(() => {
            console.error.restore();
            sinon.restore();
        });
        it("calls onSuccess parameter on success", function (done) {
            sinon.stub(axios, "post").returns(
                Promise.resolve({status: 200, data: {success: true}})
            );

            const onSuccess = sinon.spy(done),
                onError = sinon.spy();

            httpClient("url", {}, onSuccess, onError);
        }).timeout(100);

        it("calls onError parameter on internal client error", function (done) {
            sinon.stub(axios, "post").returns(
                Promise.reject("Internal Client Error")
            );

            const onSuccess = sinon.spy(),
                onError = sinon.spy(done);

            httpClient("url", {}, onSuccess, onError);
        }).timeout(100);

        it("calls onError parameter if response status is not 200", function (done) {
            sinon.stub(axios, "post").returns(
                Promise.resolve({status: 500})
            );

            const onSuccess = sinon.spy(),
                onError = sinon.spy(done);

            httpClient("url", {}, onSuccess, onError);
        }).timeout(100);

        it("calls axios.post in expected fashion", function () {
            sinon.stub(axios, "post").returns(
                Promise.resolve({status: 200})
            );

            httpClient("url", {
                nested: {
                    elements: [
                        {
                            work: "they do"
                        },
                        {
                            well: null
                        }
                    ]
                },
                alsoFlat: "work"
            }, sinon.spy(), sinon.spy());

            sinon.assert.calledOnce(axios.post);
            sinon.assert.calledWith(
                axios.post,
                "url",
                "nested%5Belements%5D%5B0%5D%5Bwork%5D=they%20do&nested%5Belements%5D%5B1%5D%5Bwell%5D=null&alsoFlat=work"
            );
        });
    });
});
