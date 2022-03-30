const Config = {
    addons: ["obliqueControl", "populationRequest", "vueAddon", "tacticalMark", "trinkwasser", "schulinfo", "trafficCount", "verkehrsstaerken", "solaratlas", "dataTable"],
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    wfsImgPath: "https://geodienste.hamburg.de/lgv-config/img/",
    zoomToFeature: {
        attribute: "flaechenid",
        wfsId: "4560",
        styleId: "location_eventlotse"
    },
    zoomToGeometry: {
        layerId: "1692",
        attribute: "bezirk_name",
        geometries: [
            "ALTONA",
            "HARBURG",
            "HAMBURG-NORD",
            "BERGEDORF",
            "EIMSBÜTTEL",
            "HAMBURG-MITTE",
            "WANDSBEK"
        ]
    },
    namedProjections: [
        // GK DHDN
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        // ETRS89 UTM
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        // LS 320: zusammen mit Detlef Koch eingepflegt und geprüft
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        // WGS84
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    footer: {
        urls: [{
            "bezeichnung": "common:modules.footer.designation",
            "url": "https://geoinfo.hamburg.de/",
            "alias": "Landesbetrieb Geoinformation und Vermessung",
            "alias_mobil": "LGV"
        }],
        showVersion: true
    },
    quickHelp: {
        imgPath: "https://geodienste.hamburg.de/lgv-config/img/"
    },
    cswId: "3",
    metaDataCatalogueId: "2",
    portalConf: "./",
    layerConf: "https://geodienste.hamburg.de/services-internet.json",
    restConf: "https://geodienste.hamburg.de/lgv-config/rest-services-internet.json",
    styleConf: "https://geodienste.hamburg.de/lgv-config/style_v3.json",
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "common:mouseHover.infoText"
    },
    startingMap3D: false,
    obliqueMap: true,
    cesiumParameter: {
        tileCacheSize: 20,
        enableLighting: true,
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        maximumScreenSpaceError: 2,
        fxaa: true
    },
    featureViaURL: {
        zoomTo: "42",
        epsg: 25832,
        layers: [
            {
                id: "42",
                geometryType: "Point",
                name: "Punkt Feature",
                styleId: "location_eventlotse"
            },
            {
                id: "4200",
                geometryType: "LineString",
                name: "Übergebene Linien Feature"
            },
            {
                id: "4020",
                geometryType: "Polygon",
                name: "Übergebene Polygon Feature"
            }
        ]
    },
    defaultToolId: "gfi",
    portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "Deutsch",
            en: "English",
            es: "Español",
            it: "Italiano",
            pt: "Português",
            tr: "Türkçe"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"]
    }
};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
