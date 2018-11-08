import _ from "underscore";
import proj4 from "proj4";
import * as Proj from "ol/proj.js";
import {register} from "ol/proj/proj4.js";

export function registerProjections (namedProjections) {
    proj4.defs(namedProjections);
    register(proj4);

    _.each(namedProjections, function (namedProjection) {
        var projection = Proj.get(namedProjection[0]);

        Proj.addProjection(projection);
    });
}
