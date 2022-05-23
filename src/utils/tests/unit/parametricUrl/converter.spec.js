import {expect} from "chai";
import {convert, convertToStringArray, convertTransparency, parseQuery} from "../../../parametricUrl/converter";
import * as crs from "@masterportal/masterportalapi/src/crs";

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

describe("src/utils/parametricUrl/converter.js", () => {
    let map = null;

    before(() => {
        map = {
            id: "ol",
            mode: "2D"
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });
    describe("convert", () => {
        it("convert String  to boolean", () => {
            expect(convert("false")).to.be.equals(false);
            expect(convert("FAlse")).to.be.equals(false);
            expect(convert("false   ")).to.be.equals(false);
            expect(convert("  false")).to.be.equals(false);
            expect(convert(false)).to.be.equals(false);

            expect(convert("true")).to.be.equals(true);
            expect(convert("True")).to.be.equals(true);
            expect(convert("true   ")).to.be.equals(true);
            expect(convert("  true")).to.be.equals(true);
            expect(convert(true)).to.be.equals(true);

            expect(convert("nix")).to.be.equals("nix");
        });
        it("convert 2 numbers as String or String[] to Array with numbers", () => {
            expect(convert("[]")).to.be.deep.equals([]);
            expect(convert("[553925,5931898]")).to.be.deep.equals([553925, 5931898]);
            expect(convert("553925,5931898")).to.be.deep.equals([553925, 5931898]);
            expect(convert(",5931898")).to.be.deep.equals(["", 5931898]);
            expect(convert(",")).to.be.deep.equals(["", ""]);
        });
        it("convert an EPSG code to a projection", () => {
            crs.registerProjections(namedProjections);

            expect(convert("EPSG:4326").name).to.be.equals("http://www.opengis.net/gml/srs/epsg.xml#4326");
            expect(convert("EPSG:25832").name).to.be.equals("http://www.opengis.net/gml/srs/epsg.xml#25832");
        });
    });
    describe("convertToStringArray", () => {
        it("converts comma separated String to Array", () => {
            expect(convertToStringArray("")).to.be.equals("");
            expect(convertToStringArray(null)).to.be.equals("");
            expect(convertToStringArray("368,717,2423,1562_0,2432,1935geofox-bahn,2444,1561_6,2941,2452")).to.be.deep.equals(["368", "717", "2423", "1562_0", "2432", "1935geofox-bahn", "2444", "1561_6", "2941", "2452"]);
        });
    });
    describe("convertTransparency", () => {
        it("convert transparency to a number array", () => {
            expect(convertTransparency("10,20")).to.be.deep.equals([10, 20]);
            expect(convertTransparency("10.123,20")).to.be.deep.equals([10, 20]);
            expect(convertTransparency("")).to.be.equals("");
        });
    });
    describe("parseQuery", () => {
        it("test parseQuery", () => {
            expect(parseQuery("Neuenfelder Straße,19")).to.be.equals("Neuenfelder Straße,19");
            expect(parseQuery("Neuenfelder straße,19")).to.be.equals("Neuenfelder Straße,19");

        });
    });
});
