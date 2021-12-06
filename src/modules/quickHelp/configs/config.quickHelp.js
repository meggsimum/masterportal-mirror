const configQuickHelp = {
    search: {
        title: "common:modules.quickHelp.search.title",
        content: {
            generalInfo: {
                title: "common:modules.quickHelp.search.generalInfo",
                list: [
                    {
                        text: "common:modules.quickHelp.search.generalInfoHelp1",
                        type: "text/html"
                    },
                    {
                        imgName: "allgemein.png",
                        imgKey: "searchbarAllgemeines1"
                    },
                    {
                        text: "common:modules.quickHelp.search.generalInfoHelp2",
                        type: "text/html"
                    },
                    {
                        imgName: "allgemein_2.png",
                        imgKey: "searchbarAllgemeines2"
                    },
                    {
                        imgName: "allgemein_3.png",
                        imgKey: "searchbarAllgemeines3"
                    }
                ]
            },
            addressSearch: {
                title: "common:modules.quickHelp.search.addressSearch",
                list: [
                    {
                        text: "common:modules.quickHelp.search.addressHelp",
                        type: "text/plain"
                    }
                ]
            },
            houseNumberHelp: {
                title: "common:modules.quickHelp.search.houseNumberSearch",
                list: [
                    {
                        text: "common:modules.quickHelp.search.houseNumberHelp",
                        type: "text/plain"
                    }
                ]
            },
            topicSearchHelp: {
                title: "common:modules.quickHelp.search.topicsSearch",
                list: [
                    {
                        text: "common:modules.quickHelp.search.topicsHelp",
                        type: "text/plain"
                    }
                ]
            },
            parcelSearch: {
                title: "common:modules.quickHelp.search.parcelSearch",
                list: [
                    {
                        text: "common:modules.quickHelp.search.parcelHelp",
                        type: "text/html"
                    },
                    {
                        imgName: "allgemein_4.png",
                        imgKey: "searchbarFlurstueckssuche"
                    }
                ]
            }
        }
    },
    tree: {
        title: "common:modules.quickHelp.topicTree.title",
        content: {
            generalInfo: {
                title: "common:modules.quickHelp.search.generalInfo",
                list: [
                    {
                        text: "common:modules.quickHelp.topicTree.topicsHelp1",
                        type: "text/html"
                    }
                ]
            },
            topics: {
                title: "common:modules.quickHelp.topicTree.topics",
                list: [
                    {
                        text: "common:modules.quickHelp.topicTree.topicsHelp2",
                        type: "text/html"
                    },
                    "themen.png",
                    {
                        text: "common:modules.quickHelp.topicTree.topicsHelp3",
                        type: "text/html",
                        interpolation: {iconCls: "bi-info-circle-fill"}
                    },
                    "themen_2.png",
                    {
                        text: "common:modules.quickHelp.topicTree.topicsHelp4",
                        type: "text/html"
                    }
                ]
            },
            selection: {
                title: "common:modules.quickHelp.topicTree.selection",
                list: [
                    {
                        text: "common:modules.quickHelp.topicTree.topicsHelp3",
                        type: "text/html",
                        interpolation: {iconCls: "bi-gear rotate"}
                    }
                ]
            },
            saveSelection: {
                title: "common:modules.quickHelp.topicTree.saveSelection",
                list: [
                    "common:modules.quickHelp.topicTree.topicsHelp6"
                ]
            }
        }
    },
    routing: {
        title: "common:modules.quickHelp.routingTool.header",
        content: {
            generalInfo: {
                title: "common:modules.quickHelp.routingTool.headerGeneral",
                list: [
                    {
                        text: "common:modules.quickHelp.routingTool.textGeneral",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_1.png",
                        imgKey: "routingTool1"
                    }
                ]
            },
            routePlanning: {
                title: "common:modules.quickHelp.routingTool.routing.header",
                list: [
                    {
                        text: "common:modules.quickHelp.routingTool.routing.text",
                        type: "text/plain"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.headerMeansOfTransport",
                        type: "text/html"
                    },
                    {
                        imgName: "routing_2.png",
                        imgKey: "routingTool2"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.textMeansOfTransport",
                        type: "text/plain"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.routing.headerAdditionOfWaypoints",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textAdditionOfWaypoints",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_3.png",
                        imgKey: "routingTool3"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textAdditionOfWaypoints2",
                        type: "text/plain"
                    },
                    {
                        text: `
<ul>
    <li>8, 52</li>
    <li>8.48552, 50.5448</li>
    <li>8.999, 48.6</li>
</ul>`,
                        type: "text/html"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.routing.headerRestrictedAreas",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textRestrictedAreas",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_4.png",
                        imgKey: "routingTool4"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.routing.headerAvoidTrafficRoutes",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textAvoidTrafficRoutes",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_5.png",
                        imgKey: "routingTool5"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.routing.headerRouteDescription",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textRouteDescription",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_6.png",
                        imgKey: "routingTool6"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.routing.headerExport",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routing.textExport",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_7.png",
                        imgKey: "routingTool7"
                    }
                ]
            },
            routingBatchProcessing: {
                title: "common:modules.quickHelp.routingTool.routingBatchProcessing.header",
                list: [
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.text",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_8.png",
                        imgKey: "routingTool8"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.listFormat",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.listCoordinates",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.listSeperation",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.listStructure",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.listExample",
                        type: "text/plain"
                    },
                    {
                        text: "<hr>",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.text2",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_9.png",
                        imgKey: "routingTool9"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.routingBatchProcessing.text3",
                        type: "text/plain"
                    }
                ]
            },
            isochrones: {
                title: "common:modules.quickHelp.routingTool.isochrones.header",
                list: [
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.text",
                        type: "text/plain"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.headerMeansOfTransport",
                        type: "text/html"
                    },
                    {
                        imgName: "routing_2.png",
                        imgKey: "routingTool2"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.textMeansOfTransport",
                        type: "text/plain"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.headerAdditionOfStartpoint",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textAdditionOfStartpoint",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_10.png",
                        imgKey: "routingTool10"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textAdditionOfStartpoint2",
                        type: "text/plain"
                    },
                    {
                        text: `
<ul>
    <li>8, 52</li>
    <li>8.48552, 50.5448</li>
    <li>8.999, 48.6</li>
</ul>`,
                        type: "text/html"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.headerOptimizationAvoidTrafficRoutes",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textOptimizationAvoidTrafficRoutes",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_11.png",
                        imgKey: "routingTool11"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.headerIntervalMaxDistance",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textIntervalMaxDistance",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_12.png",
                        imgKey: "routingTool12"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.headerPerformCalculation",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textPerformCalculation",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_13.png",
                        imgKey: "routingTool13"
                    },

                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.headerExport",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochrones.textExport",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_7.png",
                        imgKey: "routingTool7"
                    }
                ]
            },
            isochronesBatchProcessing: {
                title: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.header",
                list: [
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.text",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_14.png",
                        imgKey: "routingTool14"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.listFormat",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.listCoordinates",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.listSeperation",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.listStructure",
                        type: "text/plain"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.listExample",
                        type: "text/plain"
                    },
                    {
                        text: "<hr>",
                        type: "text/html"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.text2",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_15.png",
                        imgKey: "routingTool15"
                    },
                    {
                        text: "common:modules.quickHelp.routingTool.isochronesBatchProcessing.text3",
                        type: "text/plain"
                    },
                    {
                        imgName: "routing_16.png",
                        imgKey: "routingTool16"
                    }
                ]
            }
        }
    }
};

export default configQuickHelp;
