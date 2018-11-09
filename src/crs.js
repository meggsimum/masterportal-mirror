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


// fallback values TODO move to defaults
var namedProjections = [
    ["EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
];

// TODO move initialization/registerProjections function here?

export function getProjection (name) {
    return proj4.defs(name);
}

/*
export const getProjections = () => namedProjections.map(
    namedProjection => ({
        ...proj4.defs(namedProjection[0]),
        name: namedProjection[0]
    })
);

export const transformToMapProjection = (sourceProjection, point) => {
    const mapProjection = getCurrentProjectionSomehow(TODO);

    if (mapProjection && sourceProjection && point) {
        const targetProjection = getProjection(mapProjection.getCode());
        return proj4(sourceProjection, targetProjection, point);
    }

    return undefined;
};

export const transformFromMapProjection = (targetProjection, point) => {
    const mapProjection = getCurrentProjectionSomehow(TODO);

    if (mapProjection && targetProjection && point) {
        const sourceProjection = getProjection(mapProjection.getCode());
        return proj4(sourceProjection, targetProjection, point);
    }

    return undefined;
};

export const transform = par => {
    if (!getProjection(par.fromCRS) || !getProjection(par.toCRS) || !par.point) {
        console.error(`Koordinatentransformation abgebrochen, Eingaben waren unnvollständig. (${par})`);
        return "";
    }

    return proj4(proj4(par.fromCRS), proj4(par.toCRS), par.point);
};
*/
