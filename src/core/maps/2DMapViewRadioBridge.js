import mapCollection from "../dataStorage/mapCollection";
import findWhereJs from "../../utils/findWhereJs";
import store from "../../app-store";

const channel = Radio.channel("MapView");

channel.reply({
    "getProjection": function () {
        return mapCollection.getMapView("ol", "2D").getProjection();
    },
    "getOptions": function () {
        return findWhereJs(mapCollection.getMapView("ol", "2D").get("options"), {resolution: mapCollection.getMapView("ol", "2D").getConstrainedResolution(mapCollection.getMapView("ol", "2D").getResolution())});
    },
    "getCenter": function () {
        return mapCollection.getMapView("ol", "2D").getCenter();
    },
    "getZoomLevel": function () {
        return mapCollection.getMapView("ol", "2D").getZoom();
    },
    "getResolutions": function () {
        return mapCollection.getMapView("ol", "2D").getResolutions();
    },
    "getResolutionByScale": function (scale, scaleType) {
        return mapCollection.getMapView("ol", "2D").getResolutionByScale(scale, scaleType);
    },
    "getCurrentExtent": function () {
        return mapCollection.getMapView("ol", "2D").getCurrentExtent();
    },
    "getBackgroundImage": function () {
        return mapCollection.getMapView("ol", "2D").get("backgroundImage");
    }
});

channel.on({
    "resetView": function () {
        store.dispatch("Maps/resetView");
    },
    "setCenter": function (coords, zoomLevel) {
        store.dispatch("Maps/setCenter", {coords: coords});
        if (zoomLevel !== undefined) {
            store.dispatch("setZoomLevel", zoomLevel);
        }
    },
    "setScale": function (scale) {
        mapCollection.getMapView("ol", "2D").setResolutionByScale(scale);
    },
    "setZoomLevelDown": function () {
        store.dispatch("Maps/decreaseZoomLevel");
    },
    "setZoomLevelUp": function () {
        store.dispatch("Maps/increaseZoomLevel");
    },
    "toggleBackground": function () {
        store.dispatch("Maps/toggleBackground");
    }
});
