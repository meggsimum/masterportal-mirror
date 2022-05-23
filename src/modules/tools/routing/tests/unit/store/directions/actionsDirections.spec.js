import sinon from "sinon";
import {expect} from "chai";
import actionsDirections from "../../../../store/directions/actionsDirections";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import Select from "ol/interaction/Select";
import {RoutingWaypoint} from "../../../../utils/classes/routing-waypoint";
import {RoutingDirections} from "../../../../utils/classes/routing-directions";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";

describe("src/modules/tools/routing/store/directions/actionsDirections.js", () => {
    let state, commitSpy, commit, dispatchSpy, dispatch, dispatchMocks, getters, rootState, waypoints, wgs84Coordinates, routingDirectionsWaypointSource, routingDirectionsAvoidSource, routingDirectionsResult, routeFeature, highlightFeature, startWaypoint, endWaypoint, avoidPolygonCoordinates;

    beforeEach(() => {
        avoidPolygonCoordinates = [[[8.1, 51.1], [8.2, 51.2], [8.3, 51.3], [8.1, 51.1]]];
        routingDirectionsWaypointSource = new VectorSource();
        routingDirectionsAvoidSource = new VectorSource({
            features: [
                new Feature({
                    geometry: new Polygon(avoidPolygonCoordinates)
                })
            ]
        });

        routeFeature = new Feature({
            geometry: new LineString([[8.1, 51.1], [8.2, 51.2]]),
            isHighlight: false
        });

        highlightFeature = new Feature({
            geometry: new LineString([[8.3, 51.3], [8.4, 51.4]]),
            isHighlight: true
        });

        startWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource});
        startWaypoint.setCoordinates([8, 51]);
        startWaypoint.setIndexDirectionsLineString(0);
        endWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource});
        endWaypoint.setCoordinates([9, 52]);
        endWaypoint.setIndexDirectionsLineString(1);
        waypoints = [startWaypoint, endWaypoint];
        wgs84Coordinates = waypoints.map(point => point.getCoordinates());

        routingDirectionsResult = new RoutingDirections({
            bbox: [8.1, 51.1, 8.2, 51.2],
            distance: 12.34,
            duration: 61234,
            lineString: [[8.1, 51.1], [8.15, 51.15], [8.2, 51.2]],
            lineStringWaypointIndex: [0, 2]
        });

        commitSpy = sinon.spy();
        commit = (...args) => {
            commitSpy(...args);
            return undefined;
        };
        dispatchSpy = sinon.spy();
        dispatchMocks = {
            fetchDirections: routingDirectionsResult,
            getDirectionsCoordinatesWgs84: wgs84Coordinates,
            getRouteFeature: routeFeature,
            getHighlightFeature: highlightFeature
        };
        dispatch = (...args) => {
            dispatchSpy(...args);
            if (args[0] === "Tools/Routing/transformCoordinatesLocalToWgs84Projection") {
                return args[1];
            }
            else if (args[0] === "Tools/Routing/fetchTextByCoordinates") {
                return new RoutingGeosearchResult(args[1].coordinates[0], args[1].coordinates[1], "test");
            }
            return dispatchMocks[args[0]];
        };
        getters = {
            directionsCoordinates: wgs84Coordinates
        };

        rootState = {
            Maps: {
                mode: "2D"
            }
        };

        mapCollection.clear();
        mapCollection.addMap({
            mode: "2D",
            getView: () => ({
                fit: () => sinon.spy()
            }),
            addLayer: sinon.spy(),
            removeLayer: sinon.spy()
        }, "2D");

        state = {
            settings: {
                speedProfile: "HGV",
                preference: "SHORTEST"
            },
            routingAvoidFeaturesOptions: [],
            waypoints: waypoints,
            directionsRouteSource: new VectorSource({
                features: [
                    routeFeature,
                    highlightFeature
                ]
            }),
            directionsWaypointSource: routingDirectionsWaypointSource,
            directionsAvoidSource: routingDirectionsAvoidSource,
            directionsWaypointsDrawInteraction: new Draw({
                source: "",
                type: "Point",
                geometryFunction: undefined
            }),
            directionsAvoidDrawInteraction: new Draw({
                source: "",
                type: "Polygon",
                geometryFunction: undefined
            }),
            directionsAvoidSelectInteraction: new Select()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should findDirections", async () => {
        await actionsDirections.findDirections({state, getters, commit, dispatch, rootState});

        expect(commitSpy.args).to.deep.equal([
            ["setIsLoadingDirections", true],
            ["setRoutingDirections", routingDirectionsResult],
            ["setIsLoadingDirections", false]
        ]);

        expect(dispatchSpy.args).to.deep.equal([
            ["getDirectionsCoordinatesWgs84"],
            ["getRouteFeature"],
            ["resetRoutingDirectionsResults"],
            ["fetchDirections", {wgs84Coords: wgs84Coordinates, instructions: true}],
            ["getDirectionsCoordinatesWgs84"]
        ]);
    });

    it("should resetRoutingDirectionsResults", async () => {
        await actionsDirections.resetRoutingDirectionsResults({state, getters, commit, dispatch, rootState});

        expect(commitSpy.args).to.deep.equal([
            ["setRoutingDirections", null]
        ]);

        expect(dispatchSpy.args).to.deep.equal([
            ["getRouteFeature"]
        ]);
    });

    it("should getRouteFeature", async () => {
        const result = await actionsDirections.getRouteFeature({state, getters, commit, dispatch, rootState});

        expect(result).equal(routeFeature);
    });

    it("should getHighlightFeature", async () => {
        const result = await actionsDirections.getHighlightFeature({state, getters, commit, dispatch, rootState});

        expect(result).equal(highlightFeature);
    });

    it("should unHighlightRoute", async () => {
        await actionsDirections.unHighlightRoute({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["getHighlightFeature"]
        ]);

        expect(highlightFeature.getGeometry().getCoordinates()).to.deep.equal([]);
    });

    it("should highlightRoute with 'fromWaypointIndex' and 'toWaypointIndex'", async () => {
        await actionsDirections.highlightRoute({state, getters, commit, dispatch, rootState}, {
            fromWaypointIndex: 0,
            toWaypointIndex: 1
        });

        expect(dispatchSpy.args).to.deep.equal([
            ["getRouteFeature"],
            ["getHighlightFeature"]
        ]);

        expect(highlightFeature.getGeometry().getCoordinates()).to.deep.equal([[8.1, 51.1]]);
    });

    it("should highlightRoute with 'coordsIndex'", async () => {

        await actionsDirections.highlightRoute({state, getters, commit, dispatch, rootState}, {
            coordsIndex: [0, 1]
        });

        expect(dispatchSpy.args).to.deep.equal([
            ["getRouteFeature"],
            ["getHighlightFeature"]
        ]);

        expect(highlightFeature.getGeometry().getCoordinates()).to.deep.equal([[8.1, 51.1]]);
    });

    it("should getDirectionsCoordinatesWgs84", async () => {
        const directionsCoordinatesWgs84 = await actionsDirections.getDirectionsCoordinatesWgs84({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal(
            getters.directionsCoordinates.map(coords => ["Tools/Routing/transformCoordinatesLocalToWgs84Projection", coords, {root: true}])
        );

        expect(directionsCoordinatesWgs84).to.deep.equal(getters.directionsCoordinates);
    });

    it("should getAvoidPolygonsWgs84", async () => {
        const avoidPolygonsWgs84 = await actionsDirections.getAvoidPolygonsWgs84({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal(
            avoidPolygonCoordinates[0].map(coords => ["Tools/Routing/transformCoordinatesLocalToWgs84Projection", coords, {root: true}])
        );

        expect(avoidPolygonsWgs84).to.deep.equal({"type": "MultiPolygon", "coordinates": [avoidPolygonCoordinates]});
    });

    it("should initDirections without mapListenerAdded", async () => {
        state.mapListenerAdded = false;
        state.directionsRouteLayer = true;
        state.directionsWaypointsLayer = true;
        state.directionsAvoidLayer = true;
        await actionsDirections.initDirections({state, getters, commit, dispatch, rootState});
        expect(dispatchSpy.args).to.deep.equal([
            ["initWaypoints"],
            ["createDirectionsWaypointsModifyInteractionListener"],
            ["createDirectionsAvoidModifyInteractionListener"],
            ["createDirectionsRouteModifyInteractionListener"],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["createInteractionFromMapInteractionMode"]
        ]);

        expect(commitSpy.args).to.deep.equal([
            ["setMapListenerAdded", true]
        ]);
    });

    it("should initDirections with mapListenerAdded", async () => {
        state.mapListenerAdded = true;
        state.directionsRouteLayer = true;
        state.directionsWaypointsLayer = true;
        state.directionsAvoidLayer = true;

        await actionsDirections.initDirections({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["initWaypoints"],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["Maps/addLayerOnTop", true, {root: true}],
            ["createInteractionFromMapInteractionMode"]
        ]);
    });

    it("should createInteractionFromMapInteractionMode with mapInteractionMode 'WAYPOINTS'", async () => {
        state.mapInteractionMode = "WAYPOINTS";
        await actionsDirections.createInteractionFromMapInteractionMode({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["createDirectionsWaypointsDrawInteraction"]
        ]);
    });

    it("should createInteractionFromMapInteractionMode with mapInteractionMode 'AVOID_AREAS'", async () => {
        state.mapInteractionMode = "AVOID_AREAS";
        await actionsDirections.createInteractionFromMapInteractionMode({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["createDirectionsAvoidDrawInteraction"]
        ]);
    });

    it("should createInteractionFromMapInteractionMode with mapInteractionMode 'DELETE_AVOID_AREAS'", async () => {
        state.mapInteractionMode = "DELETE_AVOID_AREAS";
        await actionsDirections.createInteractionFromMapInteractionMode({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["createDirectionsAvoidSelectInteraction"]
        ]);
    });

    it("should closeDirections", async () => {
        await actionsDirections.closeDirections({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["removeMapInteractions"]
        ]);
    });

    it("should findWaypointBetweenLineStringIndex", async () => {
        const waypointBetweenLineStringIndex = await actionsDirections.findWaypointBetweenLineStringIndex({state, getters, commit, dispatch, rootState}, {
            lineStringIndex: 0
        });

        expect(waypointBetweenLineStringIndex).equal(0);
    });

    it("should not findWaypointBetweenLineStringIndex", async () => {
        const waypointBetweenLineStringIndex = await actionsDirections.findWaypointBetweenLineStringIndex({state, getters, commit, dispatch, rootState}, {
            lineStringIndex: 1
        });

        expect(waypointBetweenLineStringIndex).equal(null);
    });


    describe("should addWaypoint", () => {
        it("without index", async () => {
            const waypoint = await actionsDirections.addWaypoint({state, getters, commit, dispatch, rootState}, {});

            expect(waypoints.length).equal(3);
            expect(waypoints[2]).equal(waypoint);
        });

        it("with index", async () => {
            const waypoint = await actionsDirections.addWaypoint({state, getters, commit, dispatch, rootState}, {
                index: 2
            });

            expect(waypoints.length).equal(3);
            expect(waypoints[2]).equal(waypoint);
        });

        it("with index in middle", async () => {
            const waypoint = await actionsDirections.addWaypoint({state, getters, commit, dispatch, rootState}, {
                index: 1
            });

            expect(waypoints.length).equal(3);
            expect(waypoints[1]).equal(waypoint);
        });

        it("with feature", async () => {
            const featurePoint = new Feature({
                    geometry: new Point([10, 10])
                }),
                waypoint = await actionsDirections.addWaypoint({state, getters, commit, dispatch, rootState}, {
                    feature: featurePoint
                });

            expect(waypoints.length).equal(3);
            expect(waypoints[2]).equal(waypoint);
        });

        it("with feature and waypoint without coordinates", async () => {
            startWaypoint.setCoordinates([]);
            state.directionsWaypointsSource = {
                removeFeature: sinon.spy()
            };

            const featurePoint = new Feature({
                    geometry: new Point([10, 10])
                }),
                waypoint = await actionsDirections.addWaypoint({state, getters, commit, dispatch, rootState}, {
                    feature: featurePoint
                });

            expect(waypoints.length).equal(2);
            expect(waypoints[0]).equal(waypoint);
        });
    });

    describe("should removeWaypoint", () => {
        it("with 2 waypoints", async () => {
            await actionsDirections.removeWaypoint({state, getters, commit, dispatch, rootState}, {
                index: 0
            });

            expect(waypoints[0].getDisplayName()).equal(null);
            expect(waypoints[0].getIndexDirectionsLineString()).equal(null);
            expect(waypoints[0].getFeature().getGeometry().getCoordinates()).deep.to.equal([]);

            expect(commitSpy.args).to.deep.equal([
                ["setRoutingDirections", null]
            ]);
        });

        it("with more than 2 waypoints", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.removeWaypoint({state, getters, commit, dispatch, rootState}, {
                index: 1
            });

            expect(state.waypoints.length).equal(2);
            expect(thirdWaypoint.getIndex()).equal(1);
            expect(state.waypoints.includes(secondWaypoint)).to.be.false;

            expect(dispatchSpy.args).to.deep.equal([]);
        });

        it("with more than 2 waypoints and reload", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.removeWaypoint({state, getters, commit, dispatch, rootState}, {
                index: 1,
                reload: true
            });

            expect(state.waypoints.length).equal(2);
            expect(thirdWaypoint.getIndex()).equal(1);
            expect(state.waypoints.includes(secondWaypoint)).to.be.false;

            expect(dispatchSpy.args).to.deep.equal([
                ["findDirections"]
            ]);
        });
    });

    describe("should moveWaypointDown", () => {
        it("should move second waypoint to third place", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointDown({state, getters, commit, dispatch, rootState}, 1);

            expect(state.waypoints[1]).equal(thirdWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(secondWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([
                ["findDirections"]
            ]);
        });

        it("should not move waypoint with last index", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointDown({state, getters, commit, dispatch, rootState}, 2);

            expect(state.waypoints[1]).equal(secondWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(thirdWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([]);
        });

        it("should not move waypoint with negative index", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointDown({state, getters, commit, dispatch, rootState}, -1);

            expect(state.waypoints[0]).equal(firstWaypoint);
            expect(state.waypoints[0].getIndex()).equal(0);
            expect(state.waypoints[1]).equal(secondWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(thirdWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([]);
        });
    });


    describe("should moveWaypointUp", () => {
        it("should move third waypoint to second place", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointUp({state, getters, commit, dispatch, rootState}, 2);

            expect(state.waypoints[1]).equal(thirdWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(secondWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([
                ["findDirections"]
            ]);
        });

        it("should not move waypoint with index equal length", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointUp({state, getters, commit, dispatch, rootState}, 4);

            expect(state.waypoints[1]).equal(secondWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(thirdWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([]);
        });

        it("should not move waypoint with negative index", async () => {
            const firstWaypoint = new RoutingWaypoint({index: 0, source: routingDirectionsWaypointSource}),
                secondWaypoint = new RoutingWaypoint({index: 1, source: routingDirectionsWaypointSource}),
                thirdWaypoint = new RoutingWaypoint({index: 2, source: routingDirectionsWaypointSource});

            state.waypoints = [firstWaypoint, secondWaypoint, thirdWaypoint];
            await actionsDirections.moveWaypointUp({state, getters, commit, dispatch, rootState}, -1);

            expect(state.waypoints[0]).equal(firstWaypoint);
            expect(state.waypoints[0].getIndex()).equal(0);
            expect(state.waypoints[1]).equal(secondWaypoint);
            expect(state.waypoints[1].getIndex()).equal(1);
            expect(state.waypoints[2]).equal(thirdWaypoint);
            expect(state.waypoints[2].getIndex()).equal(2);

            expect(dispatchSpy.args).to.deep.equal([]);
        });
    });

    it("should initWaypoints", async () => {
        state.waypoints = [];
        await actionsDirections.initWaypoints({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["addWaypoint", {index: 0}],
            ["addWaypoint", {index: 1}]
        ]);
    });

    it("should onDirectionsWaypointsDrawEnd", async () => {
        const featurePoint = new Feature({
            geometry: new Point([10, 10])
        });

        await actionsDirections.onDirectionsWaypointsDrawEnd({state, getters, commit, dispatch, rootState}, {
            feature: featurePoint
        });

        expect(dispatchSpy.args).to.deep.equal([
            ["Tools/Routing/transformCoordinatesLocalToWgs84Projection", [10, 10], {root: true}],
            ["Tools/Routing/fetchTextByCoordinates", {coordinates: [10, 10]}, {root: true}],
            ["addWaypoint", {feature: featurePoint, displayName: "test"}],
            ["findDirections"]
        ]);
    });

    it("should removeMapInteractions", async () => {
        await actionsDirections.removeMapInteractions({state, getters, commit, dispatch, rootState});

        expect(dispatchSpy.args).to.deep.equal([
            ["removeDirectionsWaypointsDrawInteraction"],
            ["removeDirectionsAvoidDrawInteraction"],
            ["removeDirectionsAvoidSelectInteraction"]
        ]);
    });
});
