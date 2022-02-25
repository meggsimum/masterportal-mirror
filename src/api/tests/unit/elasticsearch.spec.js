import {initializeSearch, sendRequest} from "../../elasticsearch";
import {expect} from "chai";
import axios from "axios";
import sinon from "sinon";

describe("api/elasticsearch", () => {
    afterEach(() => {
        sinon.restore();
    });

    global.AbortController = sinon.spy();
    describe("init seach", () => {
        it("should initialize the search", async () => {
            const ret = {
                    data: {
                        hits: ["hit", "hit"]
                    }
                },
                requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    type: "GET",
                    url: "https://geodienste.hamburg.de/"
                },
                axiosMock = sinon.stub(axios, "get").resolves(ret);

            await initializeSearch(requestConfig);

            expect(axiosMock.calledOnce).to.be.true;
        });

    });
    describe("send Request", () => {
        it("should return promise after sending a request", async () => {
            const requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    type: "GET"
                },
                result = {
                    status: "success",
                    message: "",
                    hits: []
                },
                returnRes = {
                    data: {
                        hits: ["hit", "hit"]
                    }
                },
                url = "https://geodienste.hamburg.de/",
                axiosMock = sinon.stub(axios, "get").resolves(returnRes);

            await sendRequest(url, requestConfig, result);

            expect(axiosMock.calledOnce).to.be.true;
        });
        it("should reject axios", () => {
            const axiosStub = sinon.stub(axios, "get").returns((_g, reject) => {
                    reject({
                        ok: false,
                        status: 404,
                        text: () => {
                            return null;
                        }
                    });
                }),
                requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    type: "GET"
                },
                result = {
                    status: "success",
                    message: "",
                    hits: []
                },
                url = "https://geodienste.hamburg.de";

            sendRequest(url, requestConfig, result);

            expect(axiosStub.calledOnce).to.be.true;

        });
    });
});
