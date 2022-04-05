import {expect} from "chai";
import * as crs from "masterportalapi/src/crs";
import {getProjections} from "masterportalapi/src/crs";
import mutations from "../../../store/mutationsSupplyCoord";

const {setProjections} = mutations,
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

describe("src/modules/tools/supplyCoord/store/mutationsSupplyCoord.js", () => {

    before(() => {
        crs.registerProjections(namedProjections);
    });

    describe("setProjections", () => {
        it("initially sets the currentProjectionName to \"EPSG:25832\"", () => {
            const state = {
                projections: [],
                currentProjectionName: "",
                currentSelection: ""
            };

            setProjections(state, getProjections());

            expect(state.projections.length).to.equals(namedProjections.length);
            expect(state.currentProjectionName).to.equals("http://www.opengis.net/gml/srs/epsg.xml#25832");
            expect(state.currentSelection).to.equals("http://www.opengis.net/gml/srs/epsg.xml#25832");
        });
        it("initially sets the currentProjectionName to the first one, if no  \"EPSG:25832\" available", () => {
            const state = {
                    projections: [],
                    currentProjectionName: "",
                    currentSelection: ""
                },
                projections = getProjections().filter(proj => proj.name !== "http://www.opengis.net/gml/srs/epsg.xml#25832");

            setProjections(state, projections);

            expect(state.projections.length).to.equals(namedProjections.length - 1);
            expect(state.currentProjectionName).to.equals(projections[0].name);
            expect(state.currentSelection).to.equals(projections[0].name);
        });
        it("initially set empty projections", () => {
            const state = {
                projections: [],
                currentProjectionName: "",
                currentSelection: ""
            };

            setProjections(state, []);

            expect(state.projections.length).to.equals(0);
            expect(state.currentProjectionName).to.be.undefined;
            expect(state.currentSelection).to.be.undefined;
        });
        it("initially projections are undefined", () => {
            const state = {
                projections: [],
                currentProjectionName: "",
                currentSelection: ""
            };

            setProjections(state, undefined);

            expect(state.projections.length).to.equals(0);
            expect(state.currentProjectionName).to.be.undefined;
            expect(state.currentSelection).to.be.undefined;
        });
    });

});
