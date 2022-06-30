import {expect} from "chai";
import getWfsError from "../../../utils/getWfsError";

describe("src/api/utils/getWfsError.js", () => {
    it("should return an error if anything but an xml object with a childElementCount is given", () => {
        expect(getWfsError(undefined)).to.be.an.instanceOf(Error);
        expect(getWfsError(null)).to.be.an.instanceOf(Error);
        expect(getWfsError(1234)).to.be.an.instanceOf(Error);
        expect(getWfsError("string")).to.be.an.instanceOf(Error);
        expect(getWfsError(true)).to.be.an.instanceOf(Error);
        expect(getWfsError(false)).to.be.an.instanceOf(Error);
        expect(getWfsError([])).to.be.an.instanceOf(Error);
        expect(getWfsError({})).to.be.an.instanceOf(Error);
        expect(getWfsError({childElementCount: 0})).to.be.an.instanceOf(Error);
    });
    it("should return an error if an exceptionCode is found along the chain", () => {
        expect(getWfsError({
            childElementCount: 1,
            firstElementChild: {
                firstElementChild: {
                    firstElementChild: {
                        getAttribute: key => key === "exceptionCode",
                        textContent: "error"
                    }
                }
            }
        })).to.be.an.instanceOf(Error);
    });
    it("should not return an error if no exceptionCode was found", () => {
        expect(getWfsError({
            childElementCount: 1,
            firstElementChild: {
                firstElementChild: {
                    firstElementChild: {
                        firstElementChild: {
                            firstElementChild: {
                                firstElementChild: {
                                }
                            }
                        }
                    }
                }
            }
        })).to.not.be.an.instanceOf(Error);
    });
});
