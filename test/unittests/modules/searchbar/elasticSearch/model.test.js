import Model from "@modules/searchbar/elasticSearch/model.js";
import {expect} from "chai";

describe("modules/searchbar/elasticSearch", function () {
    let model = {};

    const config = {
        "minChars": 3,
        "serviceId": "elastic_hh",
        "type": "GET",
        "payload": {
            "id": "query",
            "params": {
                "query_string": ""
            }
        },
        "searchStringAttribute": "query_string",
        "responseEntryPath": "hits.hits",
        "triggerEvent": {
            "channel": "Parser",
            "event": "addGDILayer"
        },
        "hitMap": {
            "name": "_source.name",
            "id": "_source.id",
            "source": "_source"
        },
        "hitType": "Fachthema",
        "hitIcon": "bi-list-ul"
    };

    before(function () {
        model = new Model(config);
    });

    describe("appendSearchStringToPayload", function () {
        it("should append string to searchStringAttribute", function () {
            const payload = {
                    id: "query",
                    params: {
                        query_string: ""
                    }
                },
                searchStringAttribute = "query_string";

            expect(model.appendSearchStringToPayload(payload, searchStringAttribute, "test")).to.deep.equal({
                id: "query",
                params: {
                    query_string: "test"
                }
            });
        });
        it("should do nothing if searchStringAttribute is not found in payload", function () {
            const payload = {
                    id: "query",
                    params: {
                        query_string: ""
                    }
                },
                searchStringAttribute = "query_string_";

            expect(model.appendSearchStringToPayload(payload, searchStringAttribute, "test")).to.deep.equal({
                id: "query",
                params: {
                    query_string: ""
                }
            });
        });
    });
    describe("findAttributeByPath", function () {
        it("should find attribute on first level", function () {
            const object = {
                    level0: "helloWorld"
                },
                path = "level0";

            expect(model.findAttributeByPath(object, path)).to.equal("helloWorld");
        });
        it("should find attribute on second level", function () {
            const object = {
                    level0: {
                        level1: "helloWorld"
                    }
                },
                path = "level0.level1";

            expect(model.findAttributeByPath(object, path)).to.equal("helloWorld");
        });
        it("should find attributes and create array", function () {
            const object = {
                    level0: {
                        key0: "hello",
                        key1: "World"
                    }
                },
                path = ["level0.key0", "level0.key1"];

            expect(model.findAttributeByPath(object, path)).to.deep.equal(["hello", "World"]);
        });
    });
    describe("createHit", function () {
        it("should create hit", function () {
            const result = {
                    id: "0815",
                    name: "name",
                    x: 123456,
                    y: 456789,
                    foo: "bar",
                    deeperKey: {
                        key: "value"
                    }
                },
                hitMap = {
                    id: "id",
                    name: "name",
                    coordinate: ["x", "y"],
                    key: "deeperKey.key"
                },
                hitType = "type",
                hitIcon = "bi-abc",
                triggerEvent = {
                    channel: "MyChannel",
                    event: "MyEvent"
                };

            expect(model.createHit(result, hitMap, hitType, hitIcon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type",
                    icon: "bi-abc",
                    triggerEvent: {
                        channel: "MyChannel",
                        event: "MyEvent"
                    }
                }
            );
        });
        it("should create hit without trigger event", function () {
            const result = {
                    id: "0815",
                    name: "name",
                    x: 123456,
                    y: 456789,
                    foo: "bar",
                    deeperKey: {
                        key: "value"
                    }
                },
                hitMap = {
                    id: "id",
                    name: "name",
                    coordinate: ["x", "y"],
                    key: "deeperKey.key"
                },
                hitType = "type",
                hitIcon = "bi-abc",
                triggerEvent = {
                };

            expect(model.createHit(result, hitMap, hitType, hitIcon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type",
                    icon: "bi-abc"
                }
            );
        });
        it("should create hit with Type and Icon from result", function () {
            const result = {
                    id: "0815",
                    name: "name",
                    x: 123456,
                    y: 456789,
                    foo: "bar",
                    deeperKey: {
                        key: "value",
                        type: "type2",
                        hitIcon: "glyphicon-cba"
                    }
                },
                hitMap = {
                    id: "id",
                    name: "name",
                    coordinate: ["x", "y"],
                    key: "deeperKey.key",
                    type: "deeperKey.type",
                    icon: "deeperKey.hitIcon"
                },
                hitType = "type",
                hitIcon = "glyphicon-abc",
                triggerEvent = {
                };

            expect(model.createHit(result, hitMap, hitType, hitIcon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type",
                    icon: "glyphicon-abc"
                }
            );
        });
    });
    describe("addIgnoreIdsToPayload", () => {
        let payload;

        beforeEach(() => {
            payload = {
                id: "The_ID",
                params: {
                    query_string: "sturm"
                }
            };
        });

        it("add layerIDsToIgnore and metaIDsToIgnore to the payload, if configTree is defined and not empty", () => {
            const configTree = {
                layerIDsToIgnore: ["7777"],
                metaIDsToIgnore: ["ABC-123-DEF-456"]
            };

            expect(model.addIgnoreIdsToPayload(payload, configTree)).deep.equals({
                id: "The_ID",
                params: {
                    query_string: "sturm",
                    id: ["7777"],
                    "datasets.md_id": ["ABC-123-DEF-456"]
                }
            });
        });
        it("don't add layerIDsToIgnore and metaIDsToIgnore to the payload, if configTree is defined with empty arrays", () => {
            const configTree = {
                layerIDsToIgnore: [],
                metaIDsToIgnore: []
            };

            expect(model.addIgnoreIdsToPayload(payload, configTree)).deep.equals(payload);
        });
        it("don't add layerIDsToIgnore and metaIDsToIgnore to the payload if configTree is undefined", () => {
            const configTree = undefined;

            expect(model.addIgnoreIdsToPayload(payload, configTree)).deep.equals(payload);
        });
    });
});
