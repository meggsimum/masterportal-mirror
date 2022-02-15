import mapCollection from "../dataStorage/mapCollection";
import findWhereJs from "../../utils/findWhereJs";

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
        mapCollection.getMapView("ol", "2D").resetView();
    },
    "setCenter": function (coords, zoomLevel) {
        mapCollection.getMapView("ol", "2D").setCenterCoord(coords, zoomLevel);
    },
    "setScale": function (scale) {
        mapCollection.getMapView("ol", "2D").setResolutionByScale(scale);
    },
    "setZoomLevelDown": function () {
        mapCollection.getMapView("ol", "2D").setZoomLevelDown();
    },
    "setZoomLevelUp": function () {
        mapCollection.getMapView("ol", "2D").setZoomLevelUp();
    },
    "toggleBackground": function () {
        mapCollection.getMapView("ol", "2D").toggleBackground();
    }
});
