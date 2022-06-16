module.exports = {
    ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"],
    gfiWindow: "attached",
    simpleMap: false,
    wfsImgPath: "https://geodienste.hamburg.de/lgv-config/img/",
    allowParametricURL: true,
    zoomToFeature: {
        attribute: "flaechenid",
        imgLink: "../img/location_eventlotse.svg",
        layerId: "4561",
        wfsId: "4560"
    },
    tree: {
        orderBy: "opendata",
        saveSelection: true,
        layerIDsToIgnore: [
            "1912", "1913", "1914", "1915", "1916", "1917", // UESG
            "215", "216", "217", "218", "219", // Zuständigkeitsgrenzen
            "2935", // Baublöcke
            "1791", // nachträgliche Bodenrichtwerte lagetypisch 1964
            "2298", // Strassenbaumkataster grau
            "2627", "2628", "2629", "2630", "2631", "2632", "2633", "2634", "2635", "2636", "2637", "2638", "2639", // StaNord, wird bald abgeschaltet
            "2640", "2641", "2642", "2643", "2644", "2645", "2646", "2647", "2648", "2649", "2650", "2651", // StaNord, wird bald abgeschaltet
            "8713" // Layer Schulinfo
        ],
        layerIDsToStyle: [
            {
                "id": "1933",
                "styles": "geofox_stations",
                "name": "Haltestellen",
                "legendURL": "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png"
            },
            {
                "id": "1935",
                "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png"]
            }
        ],
        metaIDsToMerge: [
            // "757A328B-415C-4E5A-A696-353ABDC80419", // ParkraumGIS
            "4AC1B569-65AA-4FAE-A5FC-E477DFE5D303", // Großraum- und Schwertransport-Routen in Hamburg
            "3EE8938B-FF9E-467B-AAA2-8534BB505580", // Bauschutzbereich § 12 LuftVG Hamburg
            "F691CFB0-D38F-4308-B12F-1671166FF181", // Flurstücke gelb
            "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1" // Flurstücke schwarz
        ],
        metaIDsToIgnore: [
            "E70B7995-68CC-4F38-9F33-EBE72B09C5C0", // Sirenenstandorte
            "3F3929B9-0675-4AF0-A7F6-26F96BE8873C", // Bundesflächen Hamburg
            "DFA37E3E-F640-47DE-B7EF-3D3FFB11435C", // Störfallbetriebe Internet
            "09DE39AB-A965-45F4-B8F9-0C339A45B154", // MRH Fachdaten
            "51656D3F-E801-497C-952C-4F1F605843DD", // MRH Metrokarte
            "AD579C62-0471-4FA5-8C9A-38B3DCB5B2CB", // MRH Übersichtskarte-blau
            "14E3AFAE-99BE-4F1D-A3A6-6A68A1CDAC7B", // MRH Übersichtskarte-grün
            "56110E55-72C7-41F2-9F92-1C598E4E0A02", // Digitale Karte Metropolregion
            "88A22736-FE87-46F7-8A38-84F9E0E945F7", // TN für Olympia
            "DDB01922-D7B5-4323-9DDF-B68A42C559E6", // Olympiastandorte
            "AA06AD76-6110-4718-89E1-F1EDDA1DF4CF", // Regionales Raumordnungsprogramm Stade+Rotenburg
            "1C8086F7-059F-4ACF-96C5-7AFEB8F8B751", // Fachdaten der Metropolregion
            "A46086BA-4A4C-48A4-AC1D-9735DDB4FDDE", // Denkmalkartierung FIS
            "98377F7D-84AB-4089-BDF1-F962B2C173CC", // Ausgleichsflächen Internet
            "DB433BD1-1640-4FBC-A879-72402BD5CFDB", // Bodenrichtwertzonen Hamburg
            "6A0D8B9D-1BBD-441B-BA5C-6159EE41EE71", // Bodenrichtwerte für Hamburg
            "3233E124-E576-4B5D-978E-164720C4E75F", // MRH Große Verkehrsprojekte
            "C628C722-79BD-4DAD-8198-84863157B052" // Hochwasser Sperr-u. Lenkstellenverzeichnis
        ]
    },
    namedProjections: [
        ["EPSG:31461", "+title=Gauß 3° Bessel +proj=tmerc +lat_0=0 +lon_0=3 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:31462", "+title=Gauß 6° Bessel +proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"]
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "Kartographie und Gestaltung: ",
                "url": "https://geoinfo.hamburg.de/",
                "alias": "Landesbetrieb Geoinformation und Vermessung",
                "alias_mobil": "LGV"
            }
        ]
    },

    quickHelp: true,
    portalConf: "../../portal/master/",
    layerConf: "https://geodienste.hamburg.de/lgv-config/services-fhhnet-ALL.json",
    restConf: "https://geodienste.hamburg.de/lgv-config/rest-services-fhhnet.json",
    styleConf: "",
    proxyURL: "/cgi-bin/proxy.cgi",
    attributions: true,
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },
    remoteInterface: {
        postMessageUrl: "http://localhost:8080"
    },
    browserPrint: {},
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
    zoomTo: [{
        id: "zoomToGeometry",
        layerId: "1692",
        property: "bezirk_name",
        allowedValues: [
            "ALTONA",
            "HARBURG",
            "HAMBURG-NORD",
            "BERGEDORF",
            "EIMSBÜTTEL",
            "HAMBURG-MITTE",
            "WANDSBEK"
        ]
    }]
};
