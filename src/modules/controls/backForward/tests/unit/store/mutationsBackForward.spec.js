import {expect} from "chai";
import sinon from "sinon";
import mutations from "../../../store/mutationsBackForward.js";

let center,
    zoom;

const {memorize, forward, backward} = mutations,
    mockMapZeroState = {
        getCenter: () => [0, 0],
        getZoom: () => 0,
        setCenter: c => {
            center = c;
        },
        setZoom: z => {
            zoom = z;
        }
    },
    mockMapGetViewZeroState = {
        getView: () => ({
            getCenter: () => [0, 0],
            getZoom: () => 0,
            setCenter: c => {
                center = c;
            },
            setZoom: z => {
                zoom = z;
            }
        })
    },
    mockMapOneState = {
        getCenter: () => [1, 1],
        getZoom: () => 1,
        setCenter: c => {
            center = c;
        },
        setZoom: z => {
            zoom = z;
        }
    },
    zeroMemory = {
        center: [0, 0],
        zoom: 0
    },
    oneMemory = {
        center: [1, 1],
        zoom: 1
    };


describe("src/modules/controls/backForward/store/mutationsBackForward.js", () => {
    describe("memorize", () => {
        it("notes the current view's state", () => {
            const state = {
                position: null,
                memory: []
            };

            memorize(state, mockMapZeroState);

            expect(state.position).to.equal(0);
            expect(state.memory).to.eql([zeroMemory]);
        });
        it("does not note the same state twice", () => {
            const state = {
                position: null,
                memory: []
            };

            memorize(state, mockMapZeroState);
            memorize(state, mockMapZeroState);

            expect(state.position).to.equal(0);
            expect(state.memory).to.eql([zeroMemory]);
        });
        it("notes a different state as second memory", () => {
            const state = {
                position: null,
                memory: []
            };

            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);

            expect(state.position).to.equal(1);
            expect(state.memory).to.eql([zeroMemory, oneMemory]);
        });
        it("remembers at most ten states, eliminating the oldest state", () => {
            const state = {
                position: null,
                memory: []
            };

            // 11 memorizations
            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);
            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);
            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);
            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);
            memorize(state, mockMapZeroState);
            memorize(state, mockMapOneState);
            memorize(state, mockMapZeroState);

            expect(state.position).to.equal(9);
            expect(state.memory).to.eql([
                oneMemory,
                zeroMemory,
                oneMemory,
                zeroMemory,
                oneMemory,
                zeroMemory,
                oneMemory,
                zeroMemory,
                oneMemory,
                zeroMemory
            ]);
        });
        it("removes memories of future on memorization", () => {
            const state = {
                position: 1,
                memory: [
                    {center: [2, 2], zoom: 2},
                    {center: [3, 3], zoom: 3},
                    {center: [4, 4], zoom: 4},
                    {center: [5, 5], zoom: 5}
                ]
            };

            memorize(state, mockMapZeroState);

            expect(state.position).to.equal(2);
            expect(state.memory).to.eql([
                {center: [2, 2], zoom: 2},
                {center: [3, 3], zoom: 3},
                {center: [0, 0], zoom: 0}
            ]);
        });
    });
    describe("forward", () => {
        beforeEach(() => {
            sinon.stub(console, "warn").callsFake(sinon.stub());
            sinon.stub(console, "error").callsFake(sinon.stub());
        });
    
        afterEach(() => {
            console.warn.restore();
            console.error.restore();
            sinon.restore();
        });
        it("does nothing on initial state", () => {
            const state = {
                position: null,
                memory: []
            };

            center = null;
            zoom = null;

            forward(state, mockMapZeroState);

            expect(center).to.be.null;
            expect(zoom).to.be.null;
            expect(state.position).to.be.null;
            expect(state.memory).to.eql([]);
        });
        it("updates position and view's center/zoom on forward step", () => {
            const state = {
                position: 0,
                memory: [{center: [2, 2], zoom: 2}, {center: [5, 5], zoom: 5}]
            };

            center = null;
            zoom = null;

            forward(state, mockMapGetViewZeroState);

            expect(center).to.eql([5, 5]);
            expect(zoom).to.equal(5);
            expect(state.position).to.equal(1);
            expect(state.memory).to.eql([{center: [2, 2], zoom: 2}, {center: [5, 5], zoom: 5}]);
        });
        it("logs error when trying to move to inexistant memory", () => {
            const state = {
                    position: 0,
                    memory: [{center: [2, 2], zoom: 2}]
                },
            center = null;
            zoom = null;

            forward(state, mockMapZeroState);

            expect(center).to.be.null;
            expect(zoom).to.be.null;
            expect(state.position).to.equal(0);
            expect(state.memory).to.eql([{center: [2, 2], zoom: 2}]);
            expect(console.error.calledOnce).to.be.true;
        });
    });
    describe("backward", () => {
        beforeEach(() => {
            sinon.stub(console, "warn").callsFake(sinon.stub());
            sinon.stub(console, "error").callsFake(sinon.stub());
        });
    
        afterEach(() => {
            console.warn.restore();
            console.error.restore();
            sinon.restore();
        });
        it("does nothing on initial state; does not change memory", () => {
            const state = {
                position: null,
                memory: []
            };

            center = null;
            zoom = null;

            backward(state, mockMapZeroState);

            expect(center).to.be.null;
            expect(zoom).to.be.null;
            expect(state.position).to.be.null;
            expect(state.memory).to.eql([]);
        });
        it("updates position and view's center/zoom on backward step; does not change memory", () => {
            const state = {
                position: 1,
                memory: [{center: [2, 2], zoom: 2}, {center: [5, 5], zoom: 5}]
            };

            center = null;
            zoom = null;

            backward(state, mockMapGetViewZeroState);

            expect(center).to.eql([2, 2]);
            expect(zoom).to.equal(2);
            expect(state.position).to.equal(0);
            expect(state.memory).to.eql([{center: [2, 2], zoom: 2}, {center: [5, 5], zoom: 5}]);
        });
        it("logs error when trying to move to inexistant memory", () => {
            const state = {
                    position: 0,
                    memory: [{center: [2, 2], zoom: 2}]
                },
            center = null;
            zoom = null;

            backward(state, mockMapZeroState);

            expect(center).to.be.null;
            expect(zoom).to.be.null;
            expect(state.position).to.equal(0);
            expect(state.memory).to.eql([{center: [2, 2], zoom: 2}]);
            expect(console.error.calledOnce).to.be.true;
        });
    });
});
