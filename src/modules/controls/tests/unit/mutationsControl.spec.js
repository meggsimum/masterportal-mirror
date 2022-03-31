import {expect} from "chai";

import mutations from "../../mutationsControls";

const {registerControl, unregisterControl} = mutations;

describe("src/modules/controls/mutationsControls", function () {
    describe("registerControl", function () {
        it("registers a control in empty componentMap", function () {
            const control = {name: "controlName"},
                state = {
                    componentMap: {},
                    hiddenMobile: [],
                    bottomControls: []
                };

            registerControl(state, {name: control.name, control});

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.deep.equal(control);

        });
        it("registers a control in not empty componentMap", function () {
            const existingControl = {name: "existingControlName"},
                control = {name: "controlName"},
                state = {
                    componentMap: {"existingControlName": existingControl},
                    hiddenMobile: [],
                    bottomControls: []
                };

            registerControl(state, {name: control.name, control});

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.componentMap[existingControl.name]).to.deep.equal(existingControl);
        });

        it("registers a control with hiddenMobile flag", function () {
            const control = {name: "controlName"},
                state = {
                    componentMap: {},
                    hiddenMobile: [],
                    bottomControls: []
                };

            registerControl(state, {name: control.name, control, hiddenMobile: true});

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.hiddenMobile).to.be.an("array");
            expect(state.hiddenMobile[0]).to.be.equal(control.name);

        });
        it("registers a control with bottomControlsFlag flag", function () {
            const control = {name: "controlName"},
                state = {
                    componentMap: {},
                    hiddenMobile: [],
                    bottomControls: []
                };

            registerControl(state, {name: control.name, control, bottomControlsFlag: true});

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.bottomControls).to.be.an("array");
            expect(state.bottomControls[0]).to.be.equal(control.name);

        });
    });
    describe("unregisterControl", function () {
        it("unregisters an existing control", function () {
            const control = {name: "controlName"},
                state = {
                    componentMap: {"controlName": control},
                    hiddenMobile: ["controlName"],
                    bottomControls: ["controlName"]
                };

            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.hiddenMobile[0]).to.be.equal(control.name);
            expect(state.bottomControls[0]).to.be.equal(control.name);

            unregisterControl(state, "controlName");

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.be.undefined;
            expect(state.hiddenMobile.length).to.be.equal(0);
            expect(state.bottomControls.length).to.be.equal(0);

        });
        it("unregisters a not existing control", function () {
            const control = {name: "controlName"},
                state = {
                    componentMap: {"controlName": control},
                    hiddenMobile: ["controlName"],
                    bottomControls: ["controlName"]
                };

            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.hiddenMobile[0]).to.be.equal(control.name);
            expect(state.bottomControls[0]).to.be.equal(control.name);

            unregisterControl(state, "controlNameNotExists");

            expect(state.componentMap).to.be.an("object");
            expect(state.componentMap[control.name]).to.deep.equal(control);
            expect(state.hiddenMobile[0]).to.be.equal(control.name);
            expect(state.bottomControls[0]).to.be.equal(control.name);
        });
    });
});
