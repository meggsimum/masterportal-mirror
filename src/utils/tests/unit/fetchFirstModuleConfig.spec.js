import {expect} from "chai";
import sinon from "sinon";
import {
    getByDotSyntax,
    getByArraySyntax,
    createKeyPathArray,
    fetchFirstModuleConfig,
    deepMerge
} from "../../fetchFirstModuleConfig.js";

describe("src/utils/fetchFirstModuleConfig.js", () => {
    afterEach(sinon.restore);

    describe("createKeyPathArray", () => {
        it("should return false if the first parameter is a string and any part of that string separated by the second parameter is empty", () => {
            expect(createKeyPathArray(",a,b,c", ",")).to.be.false;
            expect(createKeyPathArray("a,,b,c", ",")).to.be.false;
            expect(createKeyPathArray("a,b,,c", ",")).to.be.false;
            expect(createKeyPathArray("a,b,c,", ",")).to.be.false;
        });
        it("should return an array of the first parameters parts separated by the second parameter", () => {
            expect(createKeyPathArray("a,b,c", ",")).to.deep.equal(["a", "b", "c"]);
        });
        it("should use the dot as default separator", () => {
            expect(createKeyPathArray("a.b.c")).to.deep.equal(["a", "b", "c"]);
        });
        it("should return false if the first parameter is neither a string nor an array", () => {
            expect(createKeyPathArray(undefined)).to.be.false;
            expect(createKeyPathArray(null)).to.be.false;
            expect(createKeyPathArray(1234)).to.be.false;
            expect(createKeyPathArray(true)).to.be.false;
            expect(createKeyPathArray(false)).to.be.false;
            expect(createKeyPathArray({})).to.be.false;
        });
        it("should return the first parameter unchanged if the first parameter is an one dimensional array and its contents are strings without separator", () => {
            expect(createKeyPathArray(["a", "b", "c"])).to.deep.equal(["a", "b", "c"]);
        });
        it("should return false if any part of the first parameter that is an one dimensional array is anything but a string or an array", () => {
            expect(createKeyPathArray(["a", ["b"], undefined])).to.be.false;
            expect(createKeyPathArray(["a", ["b"], null])).to.be.false;
            expect(createKeyPathArray(["a", ["b"], 1234])).to.be.false;
            expect(createKeyPathArray(["a", ["b"], true])).to.be.false;
            expect(createKeyPathArray(["a", ["b"], false])).to.be.false;
            expect(createKeyPathArray(["a", ["b"], {}])).to.be.false;
            expect(createKeyPathArray(["a", ["b", undefined]])).to.be.false;
        });
        it("should return the contents of the first parameter that might have more than one dimension containing more arrays or strings with or without separators", () => {
            expect(createKeyPathArray(["a.b.c", [["j", "k", "l.m"], "g.h.i"], "d.e.f"])).to.deep.equal(["a", "b", "c", "j", "k", "l", "m", "g", "h", "i", "d", "e", "f"]);
        });
    });

    describe("getByArraySyntax", () => {
        it("should return undefined if the first parameter is not an object nor an array", () => {
            expect(getByArraySyntax(undefined)).to.be.undefined;
            expect(getByArraySyntax(null)).to.be.undefined;
            expect(getByArraySyntax(123)).to.be.undefined;
            expect(getByArraySyntax("string")).to.be.undefined;
            expect(getByArraySyntax(true)).to.be.undefined;
            expect(getByArraySyntax(false)).to.be.undefined;
        });
        it("should return undefined if no value is found at the first parameter in any step of the second parameter", () => {
            expect(getByArraySyntax({}, ["foo", "bar", "baz"])).to.be.undefined;
            expect(getByArraySyntax({foo: {}}, ["foo", "bar", "baz"])).to.be.undefined;
            expect(getByArraySyntax({foo: {bar: {}}}, ["foo", "bar", "baz"])).to.be.undefined;
        });
        it("should return the value found in the first parameter following keys of second parameter", () => {
            expect(getByArraySyntax({foo: {bar: {baz: true}}}, ["foo", "bar", "baz"])).to.be.true;
        });
    });

    describe("getByDotSyntax", () => {
        it("should log a warning and return undefined it an unexpected second parameter is given", () => {
            sinon.stub(console, "warn");
            expect(getByDotSyntax("obj", undefined)).to.be.undefined;
            expect(console.warn.calledOnce).to.be.true;
        });
        it("should return the value found in the first parameter following keys of second parameter, separated by third parameter", () => {
            expect(getByDotSyntax({foo: {bar: {baz: true}}}, "foo,bar,baz", ",")).to.be.true;
        });
    });

    describe("deepMerge", () => {
        it("should return the second parameter if the first parameter is not an object nor an array", () => {
            expect(deepMerge(undefined, "something")).to.equal("something");
            expect(deepMerge(null, "something")).to.equal("something");
            expect(deepMerge(123, "something")).to.equal("something");
            expect(deepMerge("string", "something")).to.equal("something");
            expect(deepMerge(true, "something")).to.equal("something");
            expect(deepMerge(false, "something")).to.equal("something");
        });
        it("should return a copy of the first parameter that is an object if the second parameter is not an object nor an array", () => {
            const source = {a: 1, b: 2, c: 3},
                result = deepMerge(source, "something");

            expect(result).to.deep.equal({a: 1, b: 2, c: 3});
            result.d = 4;
            expect(source).to.deep.equal({a: 1, b: 2, c: 3});
        });
        it("should return a copy of the first parameter that is an array if the second parameter is not an object nor an array", () => {
            const source = [1, 2, 3],
                result = deepMerge(source, "something");

            expect(result).to.deep.equal([1, 2, 3]);
            result.push(4);
            expect(source).to.deep.equal([1, 2, 3]);
        });
        it("should copy the elements of the first parameter into the second parameter if none of which are objects or arrays", () => {
            const source = {
                    foo: "bar",
                    foobar: "baz"
                },
                target = {
                    foo: "qrz",
                    qruz: "qruuz"
                },
                result = deepMerge(source, target);

            expect(source).to.deep.equal({foo: "bar", foobar: "baz"});
            expect(target).to.deep.equal({foo: "bar", foobar: "baz", qruz: "qruuz"});
            expect(result).to.deep.equal({foo: "bar", foobar: "baz", qruz: "qruuz"});
        });
        it("should deep merge both elements together", () => {
            const source = [
                    {foo: "bar"},
                    1234,
                    "string"
                ],
                target = {
                    foo: "foobar",
                    baz: [1, 2, {qrz: "qruz"}],
                    foobar: 1
                },
                result = deepMerge(source, target);

            expect(source).to.deep.equal([{foo: "bar"}, 1234, "string"]);
            expect(target).to.deep.equal({
                "0": {foo: "bar"},
                "1": 1234,
                "2": "string",
                foo: "foobar",
                baz: [1, 2, {qrz: "qruz"}],
                foobar: 1
            });
            expect(result).to.deep.equal({
                "0": {foo: "bar"},
                "1": 1234,
                "2": "string",
                foo: "foobar",
                baz: [1, 2, {qrz: "qruz"}],
                foobar: 1
            });
        });
    });

    describe("fetchFirstModuleConfig", () => {
        it("should log a warning and return false if the first parameter is not an object with an object at state key", () => {
            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(undefined)).to.be.false;
            expect(console.error.called).to.be.false;
            expect(console.warn.calledOnce).to.be.true;

            expect(fetchFirstModuleConfig(null)).to.be.false;
            expect(fetchFirstModuleConfig(1234)).to.be.false;
            expect(fetchFirstModuleConfig("string")).to.be.false;
            expect(fetchFirstModuleConfig(true)).to.be.false;
            expect(fetchFirstModuleConfig(false)).to.be.false;
            expect(fetchFirstModuleConfig({})).to.be.false;
            expect(fetchFirstModuleConfig([])).to.be.false;
        });
        it("should log a warning and return false if the first parameter has no rootGetters key", () => {
            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig({state: {}})).to.be.false;
            expect(console.error.called).to.be.false;
            expect(console.warn.calledOnce).to.be.true;
        });
        it("should log a warning and return false if the first parameter has a rootGetters key without toolConfig which should be a function", () => {
            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: false}})).to.be.false;
            expect(console.error.called).to.be.false;
            expect(console.warn.calledOnce).to.be.true;
        });
        it("should log a warning and return false if the second parameter is not an array", () => {
            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, undefined)).to.be.false;
            expect(console.error.called).to.be.false;
            expect(console.warn.calledOnce).to.be.true;

            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, null)).to.be.false;
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, 1234)).to.be.false;
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, "string")).to.be.false;
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, true)).to.be.false;
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, false)).to.be.false;
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, {})).to.be.false;
        });
        it("should return false without triggering warnings if the second parameter is an empty array and recursiveFallback is false", () => {
            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig({state: {}, rootGetters: {toolConfig: () => false}}, [], "moduleName", false)).to.be.false;
            expect(console.error.called).to.be.false;
            expect(console.warn.called).to.be.false;
        });
        it("should call rootGetters.toolConfig if the second parameter is an empty array and recursiveFallback is true, should put result into state", () => {
            const context = {state: {}, rootGetters: {toolConfig: () => ["source"]}};

            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(context, [], "moduleName", true)).to.be.true;
            expect(context.state).to.deep.equal({"0": "source"});
            expect(console.error.called).to.be.false;
            expect(console.warn.called).to.be.false;
        });
        it("should follow state.rootState for each given path, should return true without errors if any path was found, should put result into state", () => {
            const context = {
                state: {
                    key: true
                },
                rootGetters: {toolConfig: () => false},
                rootState: {
                    a: {b: {key: "value"}}
                }
            };

            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(context, ["a.c", "a.b"], "moduleName", false)).to.be.true;
            expect(context.state).to.deep.equal({key: "value"});
            expect(console.error.called).to.be.false;
            expect(console.warn.called).to.be.false;
        });
        it("should follow state.rootState for each path, should return true with errors if any path is found but not an object, should put result into state", () => {
            const context = {
                state: {
                    key: true
                },
                rootGetters: {toolConfig: () => false},
                rootState: {
                    a: {
                        b: {key: "value"},
                        c: "not an object"
                    }
                }
            };

            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(context, ["a.c", "a.b"], "moduleName", false)).to.be.true;
            expect(context.state).to.deep.equal({key: "value"});
            expect(console.error.calledOnce).to.be.true;
            expect(console.warn.calledOnce).to.be.true;
        });
        it("should follow state.rootState for each path, should return true without errors if path is not found but part of defaultsNotInState, should put result into state", () => {
            const context = {
                    state: {
                        key: true
                    },
                    rootGetters: {toolConfig: () => false},
                    rootState: {
                        a: {
                            b: {
                                key: "value",
                                i18nextTranslate: true,
                                useConfigName: true,
                                type: true,
                                parentId: true,
                                onlyDesktop: true
                            }
                        }
                    }
                },
                expected = {
                    key: "value",
                    i18nextTranslate: true,
                    useConfigName: true,
                    type: true,
                    parentId: true,
                    onlyDesktop: true
                };

            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(context, ["a.b"], "moduleName", false)).to.be.true;
            expect(context.state).to.deep.equal(expected);
            expect(console.error.called).to.be.false;
            expect(console.warn.called).to.be.false;
        });
        it("should use the state found under moduleName instead of the basic state", () => {
            const context = {
                state: {
                    key: true,
                    shouldNotOccure: true,
                    moduleName: {
                        key: false
                    }
                },
                rootGetters: {toolConfig: () => false},
                rootState: {
                    a: {b: {key: "value"}}
                }
            };

            sinon.stub(console, "error");
            sinon.stub(console, "warn");
            expect(fetchFirstModuleConfig(context, ["a.b"], "moduleName", false)).to.be.true;
            expect(context.state).to.deep.equal({key: "value"});
            expect(console.error.called).to.be.false;
            expect(console.warn.called).to.be.false;
        });
    });
});
