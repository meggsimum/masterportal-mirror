const state = {
    active: false,
    id: "featureMeasure",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.featureMeasure",
    icon: "bi-arrows-angle-expand",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false,

    featureA: null,
    featureB: null,
    featureALayerId: "",
    featureBLayerId: "",
    highlightVectorRulesPointLine: {
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        }
    },

    lineStringUnits: ["m", "km"],
    selectedUnit: "0",
    distance: 0
};

export default state;
