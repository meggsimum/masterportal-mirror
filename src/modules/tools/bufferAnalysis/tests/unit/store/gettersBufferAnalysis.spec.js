import {expect} from "chai";
import getters from "../../../store/gettersBufferAnalysis";
import stateBufferAnalysis from "../../../store/stateBufferAnalysis";
import {ResultType} from "../../../store/enums";
import * as jsts from "jsts/dist/jsts";
import {Style} from "ol/style";


const {
    active,
    id,
    name,
    icon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI,
    selectedSourceLayer,
    selectedTargetLayer,
    savedUrl,
    resultType,
    bufferRadius,
    bufferLayer,
    resultLayer,
    selectOptions,
    intersections,
    resultFeatures,
    jstsParser,
    geoJSONWriter,
    bufferStyle
} = getters;

describe("src/modules/tools/bufferAnalysis/store/gettersBufferAnalysis.js", () => {
    describe("BufferAnalysis getters", () => {
        it("returns the active from state", () => {
            expect(active(stateBufferAnalysis)).to.be.false;
        });
        it("returns the id from state", () => {
            expect(id(stateBufferAnalysis)).to.equals("bufferAnalysis");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateBufferAnalysis)).to.be.equals("common:menu.tools.bufferAnalysis");
        });
        it("returns the icon default value from state", () => {
            expect(icon(stateBufferAnalysis)).to.equals("bi-arrows-angle-expand");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(renderToWindow(stateBufferAnalysis)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(resizableWindow(stateBufferAnalysis)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(isVisibleInMenu(stateBufferAnalysis)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(deactivateGFI(stateBufferAnalysis)).to.be.false;
        });
        it("returns the selectedSourceLayer default value from state", () => {
            expect(selectedSourceLayer(stateBufferAnalysis)).to.be.null;
        });
        it("returns the selectedTargetLayer default value from state", () => {
            expect(selectedTargetLayer(stateBufferAnalysis)).to.be.null;
        });
        it("returns the savedUrl default value from state", () => {
            expect(savedUrl(stateBufferAnalysis)).to.be.null;
        });
        it("returns the resultType default value from state", () => {
            expect(resultType(stateBufferAnalysis)).to.equal(ResultType.OUTSIDE);
        });
        it("returns the bufferRadius default value from state", () => {
            expect(bufferRadius(stateBufferAnalysis)).to.equal(0);
        });
        it("returns the bufferLayer default value from state", () => {
            expect(bufferLayer(stateBufferAnalysis)).to.eql({});
        });
        it("returns the resultLayer default value from state", () => {
            expect(resultLayer(stateBufferAnalysis)).to.eql({});
        });
        it("returns the selectOptions default value from state", () => {
            expect(selectOptions(stateBufferAnalysis)).to.be.empty;
        });
        it("returns the intersections default value from state", () => {
            expect(intersections(stateBufferAnalysis)).to.be.empty;
        });
        it("returns the resultFeatures default value from state", () => {
            expect(resultFeatures(stateBufferAnalysis)).to.be.empty;
        });
        it("returns the jstsParser default value from state", () => {
            expect(jstsParser(stateBufferAnalysis)).to.be.instanceof(jsts.io.OL3Parser);
        });
        it("returns the geoJSONWriter default value from state", () => {
            expect(geoJSONWriter(stateBufferAnalysis)).to.be.instanceof(jsts.io.GeoJSONWriter);
        });
        it("returns the bufferStyle default value from state", () => {
            expect(bufferStyle(stateBufferAnalysis)).to.be.instanceof(Style);
        });
    });
});
