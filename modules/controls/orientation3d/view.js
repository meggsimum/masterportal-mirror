import Orientation3DTemplate from "text-loader!./template.html";
import {ViewDirection} from "vcs-oblique/src/vcs/oblique/viewDirection";
import Orientation3DModel from "./model";

const Orientation3DView = Backbone.View.extend({
    events: {
        "click .3d-control-btn": "buttonClicked",
        "mousedown .compass-pointer-north": "northDown",
        "click .compass-pointer-north": "northUp",
        "click .compass-pointer-south": "pointerClicked",
        "click .compass-pointer-east": "pointerClicked",
        "click .compass-pointer-west": "pointerClicked"
    },
    initialize: function () {
        const channel = Radio.channel("Map"),
            obliqueChannel = Radio.channel("ObliqueMap");

        this.model = new Orientation3DModel();
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.pointerNorthText) {
                    // listening to one text changed should be enaught to know what's happening
                    this.render();
                }
            }
        });

        this.render();
        // Update to BT5 Display classes, do not use jQuery hide/show
        // this.$el.hide();
        this.$el.removeClass("d-md-block");
        this.mapChange(Radio.request("Map", "getMapMode"));
        channel.on({
            "change": this.mapChange
        }, this);

        obliqueChannel.on({
            "newImage": this.newImage
        }, this);
    },
    className: "row",
    template: _.template(Orientation3DTemplate),
    mapChange: function (map) {
        if (map === "Oblique") {
            this.showOblique();
            this.newImage(Radio.request("ObliqueMap", "getCurrentImage"));
        }
        else if (map === "3D") {
            this.show3d();
        }
        else if (map === "2D") {
            this.hide();
        }
    },
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },
    hide: function () {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
        this.$el.find(".compass").removeClass("oblique");
        this.$el.find(".control-box-container").removeClass("oblique");
        this.$el.find(".compass-pointer").css({transform: "rotate(0rad)"});
        this.is3d = false;
        // Update to BT5 Display classes, do not use jQuery hide/show
        // this.$el.hide();
        this.$el.removeClass("d-md-block");
    },
    showOblique: function () {
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
        this.is3d = false;
        this.$el.find(".compass").addClass("oblique");
        this.$el.find(".control-box-container").addClass("oblique");
        // Update to BT5 Display classes, do not use jQuery hide/show
        // this.$el.show();
        this.$el.addClass("d-md-block");
    },
    show3d: function () {
        const scene = Radio.request("Map", "getMap3d").getCesiumScene(),
            camera = scene.camera;

        this.is3d = true;

        this.$el.find(".compass").removeClass("oblique");
        this.$el.find(".control-box-container").removeClass("oblique");
        if (this.unlisten) {
            this.unlisten();
            this.unlisten = null;
        }
        this.unlisten = scene.postRender.addEventListener(function () {
            this.$el.find("#north-pointer").css({transform: "rotate(" + camera.heading + "rad)"});
        }.bind(this));
        // Update to BT5 Display classes, do not use jQuery hide/show
        // this.$el.show();
        this.$el.addClass("d-md-block");
    },
    buttonClicked: function (event) {
        const command = event.target.id;
        let zoom;

        if (this.is3d) {
            this.move3d(event);
        }
        else if ((command === "zoom-in" || command === "zoom-out") && Radio.request("ObliqueMap", "isActive")) {
            if (Radio.request("ObliqueMap", "getOLMap")) {
                zoom = Radio.request("ObliqueMap", "getOLMap").getView().getZoom();

                if (command === "zoom-in") {
                    Radio.request("ObliqueMap", "getOLMap").getView().setZoom(zoom + 1);
                }
                else {
                    Radio.request("ObliqueMap", "getOLMap").getView().setZoom(zoom - 1);
                }
            }
        }
    },
    move3d: function (event) {
        const scene = Radio.request("Map", "getMap3d").getCesiumScene(),
            camera = scene.camera,
            distance = camera.positionCartographic.height / 2,
            angle = 0.15,
            down = camera.pitch + angle > 0 ? 0 : angle,
            up = camera.pitch - angle < Math.PI / -2 ? 0 : angle,
            directions = {
                "compass_north": camera.moveUp.bind(camera, distance),
                "compass_south": camera.moveDown.bind(camera, distance),
                "compass_east": camera.moveRight.bind(camera, distance),
                "compass_west": camera.moveLeft.bind(camera, distance),
                "tilt-down": camera.lookUp.bind(camera, down),
                "tilt-up": camera.lookDown.bind(camera, up),
                "zoom-in": camera.zoomIn.bind(camera, distance),
                "zoom-out": camera.zoomOut.bind(camera, distance)
            };

        directions[event.target.id]();
    },
    newImage: function (image) {
        let rotation = 0;

        if (image) {
            switch (image.viewDirection) {
                case ViewDirection.NORTH:
                    rotation = 0;
                    break;
                case ViewDirection.SOUTH:
                    rotation = 180;
                    break;
                case ViewDirection.EAST:
                    rotation = 270;
                    break;
                case ViewDirection.WEST:
                    rotation = 90;
                    break;
                default:
                    rotation = 0;
            }
            this.$el.find(".compass-pointer").css({transform: "rotate(" + rotation + "deg)"});
        }
    },
    pointerClicked: function (event) {
        const source = event.target.id;

        switch (source) {
            case "north-pointer":
                Radio.trigger("ObliqueMap", "changeDirection", "north");
                break;
            case "south-pointer":
                Radio.trigger("ObliqueMap", "changeDirection", "south");
                break;
            case "east-pointer":
                Radio.trigger("ObliqueMap", "changeDirection", "east");
                break;
            case "west-pointer":
                Radio.trigger("ObliqueMap", "changeDirection", "west");
                break;
            default:
                break;
        }
    },
    northDown: function (event) {
        let offsetRect = "",
            scene = "",
            camera = "",
            ray = "",
            groundPositionCartesian = "";

        if (!this.is3d) {
            return;
        }

        offsetRect = this.$el.find("#north-pointer").get(0).getBoundingClientRect();
        scene = Radio.request("Map", "getMap3d").getCesiumScene();
        camera = scene.camera;
        ray = new Cesium.Ray(camera.position, camera.direction);
        groundPositionCartesian = scene.globe.pick(ray, scene);

        this.startTime = new Date().getTime();

        this.cursorPosition = {x: event.clientX, y: event.clientY};
        this.correction = {
            y: offsetRect.top + offsetRect.height / 2 - this.cursorPosition.y,
            x: offsetRect.left + offsetRect.width / 2 - this.cursorPosition.x
        };

        if (groundPositionCartesian) {
            this.destination = groundPositionCartesian;
            this.distance = Cesium.Cartesian3.distance(camera.position, groundPositionCartesian);
        }

        this.mouseDraggedBound = this.mouseDragged.bind(this);
        window.addEventListener("mouseup", this.northUp.bind(this), {
            "once": true
        });

        this.$el.on("mousemove", this.mouseDraggedBound);

    },
    northUp: function (event) {
        let endTime;

        if (this.is3d) {
            endTime = new Date().getTime();

            if (endTime - this.startTime < 200) {
                this.setHeading(0);
            }
            this.$el.off("mousemove", this.mouseDraggedBound);
        }
        else {
            // oblique
            this.pointerClicked(event);
        }
    },
    mouseDragged: function (event) {
        let offsetRect = "",
            top = "",
            left = "",
            y = "",
            x = "",
            rads = "";

        if (!this.is3d) {
            return;
        }

        offsetRect = this.$el.find(".compass").get(0).getBoundingClientRect();
        top = offsetRect.top + offsetRect.height / 2;
        left = offsetRect.left + offsetRect.width / 2;
        y = event.clientY - top + this.correction.y;
        x = event.clientX - left + this.correction.x;
        rads = Math.atan2(y, x) + Math.PI / 2;

        event.preventDefault();
        rads = rads > 0 ? rads : rads + 2 * Math.PI;

        this.setHeading(rads);
    },
    setHeading: function (heading) {
        const scene = Radio.request("Map", "getMap3d").getCesiumScene(),
            camera = scene.camera,
            options = {
                orientation: {
                    pitch: camera.pitch,
                    roll: camera.roll,
                    heading: heading
                }
            };

        if (this.destination) {
            options.destination = this.destination;
        }

        camera.setView(options);
        if (this.distance !== null) {
            camera.moveBackward(this.distance);
        }
    }
});

export default Orientation3DView;
