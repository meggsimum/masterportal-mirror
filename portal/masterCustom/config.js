const Config = {
    addons: ["trinkwasser", "schulinfo", "trafficCount", "verkehrsstaerken", "solaratlas", "dataTable"],
    footer: {
        urls: [
            {
                "bezeichnung": "common:modules.footer.designation",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "common:mouseHover.infoText"
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
    portalConf: "../../portal/master/",
    remoteInterface: {
        postMessageUrl: "https://localhost:9001"
    },
    quickHelp: {
        imgPath: "https://geodienste.hamburg.de/lgv-config/img/"
    },
    layerConf: "https://geodienste.hamburg.de/services-internet.json",
    restConf: "https://geodienste.hamburg.de/lgv-config/rest-services-internet.json",
    styleConf: "https://geodienste.hamburg.de/lgv-config/style_v3.json",
    wfsImgPath: "https://geodienste.hamburg.de/lgv-config/img/",
    zoomToFeature: {
        attribute: "flaechenid",
        styleId: "location_eventlotse",
        wfsId: "4560"
    },
    scaleLine: true,
    startingMap3D: false,
    obliqueMap: true,
    cesiumParameter: {
        fog: {
            enabled: true,
            density: 0.0002,
            screenSpaceErrorFactor: 2.0
        },
        fxaa: true,
        globe: {
            enableLighting: true,
            maximumScreenSpaceError: 2,
            tileCacheSize: 20
        }
    },
    portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "Deutsch",
            en: "English",
            es: "Español",
            it: "Italiano",
            platt: "Platt",
            pt: "Português",
            ru: "Русский",
            tr: "Türkçe",
            ua: "Українська"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"]
    }
};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
