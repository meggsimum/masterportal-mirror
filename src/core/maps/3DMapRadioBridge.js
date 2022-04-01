import mapCollection from "../dataStorage/mapCollection";
import api from "masterportalAPI/src/maps/api";
import store from "../../../src/app-store";

const channel = Radio.channel("Map");

channel.reply({
    "isMap3d": function () {
        return store.getters["Maps/is3D"];
    },
    "getMap3d": function () {
        return mapCollection.getMap("olcs", "3D");
    }
});

channel.on({
    "setShadowTime": function (shadowTime) {
        store.dispatch("Maps/setShadowTime", shadowTime, {root: true});
    },
    "setCameraParameter": function (cameraParams) {
        api.map.olcsMap.setCameraParameter(cameraParams, mapCollection.getMap("olcs", "3D"), Cesium);
    }
});
