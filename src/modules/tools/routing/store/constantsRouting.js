import DirectionsItem from "../components/Directions/DirectionsItem.vue";
import IsochronesItem from "../components/Isochrones/IsochronesItem.vue";

const speedProfileOptions = [
        "CAR", "HGV", "CYCLING", "FOOT", "WHEELCHAIR"
    ],
    avoidSpeedProfileOptions = [
        {id: "HIGHWAYS", availableProfiles: ["CAR", "HGV"]},
        {id: "TOLLWAYS", availableProfiles: ["CAR", "HGV"]},
        {id: "FERRIES", availableProfiles: ["CAR", "HGV", "CYCLING", "FOOT", "WHEELCHAIR"]},
        {id: "STEPS", availableProfiles: ["CYCLING", "FOOT", "WHEELCHAIR"]}
    ],
    routingToolOptions = [
        {id: "DIRECTIONS", component: DirectionsItem},
        {id: "ISOCHRONES", component: IsochronesItem}
    ],
    downloadFormatOptions = [
        "KML", "GEOJSON", "GPX"
    ],
    nonOptionalConfigFields = [
        "geosearch.type",
        "geosearch.serviceId",
        "geosearchReverse.type",
        "geosearchReverse.serviceId",
        "directionsSettings.type",
        "directionsSettings.serviceId",
        "isochronesSettings.type",
        "isochronesSettings.serviceId"
    ];

export {speedProfileOptions, avoidSpeedProfileOptions, routingToolOptions, downloadFormatOptions, nonOptionalConfigFields};
