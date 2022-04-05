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
        "hitGlyphicon": "glyphicon-list"
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
                hitGlyphicon = "glyphicon-abc",
                triggerEvent = {
                    channel: "MyChannel",
                    event: "MyEvent"
                };

            expect(model.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type",
                    glyphicon: "glyphicon-abc",
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
                hitGlyphicon = "glyphicon-abc",
                triggerEvent = {
                };

            expect(model.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type",
                    glyphicon: "glyphicon-abc"
                }
            );
        });
        it("should create hit with Type and Glyphicon from result", function () {
            const result = {
                    id: "0815",
                    name: "name",
                    x: 123456,
                    y: 456789,
                    foo: "bar",
                    deeperKey: {
                        key: "value",
                        type: "type2",
                        hitGlyphicon: "glyphicon-cba"
                    }
                },
                hitMap = {
                    id: "id",
                    name: "name",
                    coordinate: ["x", "y"],
                    key: "deeperKey.key",
                    type: "deeperKey.type",
                    glyphicon: "deeperKey.hitGlyphicon"
                },
                hitType = "type",
                hitGlyphicon = "glyphicon-abc",
                triggerEvent = {
                };

            expect(model.createHit(result, hitMap, hitType, hitGlyphicon, triggerEvent)).to.deep.equal(
                {
                    id: "0815",
                    name: "name",
                    coordinate: [123456, 456789],
                    key: "value",
                    type: "type2",
                    glyphicon: "glyphicon-cba"
                }
            );
        });
    });
});
