import mapCollection from "../dataStorage/mapCollection";
import api from "masterportalAPI/src/maps/api";

const channel = Radio.channel("Map");

channel.reply({
    "isMap3d": function () {
        return mapCollection.getMap("olcs", "3D") && mapCollection.getMap("olcs", "3D").isMap3d();
    },
    "getMap3d": function () {
        return mapCollection.getMap("olcs", "3D");
    }
});

channel.on({
    "setShadowTime": function (shadowTime) {
        mapCollection.getMap("olcs", "3D").setShadowTime(shadowTime);
    },
    "setCameraParameter": function (cameraParams) {
        api.map.olcsMap.setCameraParameter(cameraParams, mapCollection.getMap("olcs", "3D"), Cesium);
    }
});
