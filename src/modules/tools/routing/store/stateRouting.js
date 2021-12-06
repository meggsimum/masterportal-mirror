const state = {
    // mandatory
    active: false,
    id: "routing",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.routing",
    icon: "bi-signpost-2",
    renderToWindow: false,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,

    // Navigation Parameter
    activeRoutingToolOption: "DIRECTIONS",
    // entries in config.json are only added and dont replace routingToolOptions
    // Defaults are set in gettersRouting.js
    routingToolOptions: [],
    // routingToolOptions: ["DIRECTIONS", "ISOCHRONES"],

    // Used to keep Track of the current process of batchProcessing
    taskHandler: null,

    // Download Parameter
    download: {
        fileName: "",
        format: "GEOJSON"
    },

    // Routing Geosearch Parameter
    geosearch: {
        minChars: 3,
        limit: 10,
        // type: "NOMINATIM",
        // serviceId: "nominatim_suche"
        // type: "BKG",
        // serviceId: "bkg_geosearch"
        type: null,
        serviceId: null
    },
    geosearchReverse: {
        // type: "NOMINATIM",
        // serviceId: "nominatim_reverse"
        // type: "BKG",
        // serviceId: "bkg_geosearch"
        type: null,
        serviceId: null,
        distance: 1000,
        filter: null
    },
    directionsSettings: {
        // type: "ORS",
        // serviceId: "bkg_ors",
        type: null,
        serviceId: null,
        speedProfile: "CAR",
        preference: "RECOMMENDED",
        styleRoute: {
            fillColor: [255, 44, 0],
            width: 6,
            highlightColor: [255, 255, 255],
            highlightWidth: 9,
            partHighlightColor: [255, 255, 255],
            partHighlightWidth: 3
        },
        styleWaypoint: {
            lineColor: [255, 127, 0],
            lineWidth: 4,
            fillColor: [255, 127, 0],
            textFillColor: "#000",
            textLineColor: "#fff",
            textLineWidth: 3,
            opacity: 0.3,
            radius: 8
        },
        styleAvoidAreas: {
            lineColor: [0, 127, 255],
            lineWidth: 2,
            fillColor: [0, 127, 255],
            opacity: 0.3,
            pointRadius: 8,
            pointLineWidth: 4
        },
        batchProcessing: {
            // If BatchProcessing should be displayed
            enabled: false,
            // Is Checkbox checked?
            active: false,
            limit: 1000,
            maximumConcurrentRequests: 3
        }
    },
    isochronesSettings: {
        // type: "ORS",
        // serviceId: "bkg_ors",
        type: null,
        serviceId: null,
        speedProfile: "CAR",
        isochronesMethodOption: "TIME",
        // Distance
        distanceValue: 30,
        minDistance: 1,
        maxDistance: 400,
        // Time
        timeValue: 30,
        minTime: 1,
        maxTime: 180,
        // Interval
        intervalValue: 15,
        minInterval: 3,
        maxInterval: 30,
        styleCenter: {
            lineColor: [255, 127, 0],
            lineWidth: 4,
            fillColor: [255, 127, 0],
            opacity: 0.3,
            radius: 8
        },
        styleIsochrones: {
            lineWidth: 2,
            opacity: 0.65,
            startColor: [66, 245, 78],
            endColor: [245, 66, 66]
        },
        batchProcessing: {
            // If BatchProcessing should be displayed
            enabled: false,
            // Is Checkbox checked?
            active: false,
            limit: 1000,
            maximumConcurrentRequests: 3
        }
    }
};

export default state;
