import findWhereJs from "../../utils/findWhereJs";
import store from "../../app-store";

const channel = Radio.channel("MapView");

channel.reply({
    "getProjection": function () {
        return mapCollection.getMapView("2D").getProjection();
    },
    "getOptions": function () {
        return findWhereJs(mapCollection.getMapView("2D").get("options"), {resolution: mapCollection.getMapView("2D").getConstrainedResolution(mapCollection.getMapView("2D").getResolution())});
    },
    "getCenter": function () {
        return mapCollection.getMapView("2D").getCenter();
    },
    "getZoomLevel": function () {
        return mapCollection.getMapView("2D").getZoom();
    },
    "getResolutions": function () {
        return mapCollection.getMapView("2D").getResolutions();
    },
    "getResolutionByScale": function (scale, scaleType) {
        // eslint-disable-next-line new-cap
        return store.getters["Maps/getResolutionByScale"](scale, scaleType);
    },
    "getCurrentExtent": function () {
        return store.getters["Maps/getCurrentExtent"];
    },
    "getBackgroundImage": function () {
        return mapCollection.getMapView("2D").get("backgroundImage");
    }
});

channel.on({
    "resetView": function () {
        store.dispatch("Maps/resetView");
    },
    "setCenter": function (coords, zoomLevel) {
        store.dispatch("Maps/setCenter", coords);
        if (zoomLevel !== undefined) {
            store.dispatch("Maps/setZoomLevel", zoomLevel);
        }
    },
    "setScale": function (scale) {
        store.commit("Maps/setResolutionByScale", scale);
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
