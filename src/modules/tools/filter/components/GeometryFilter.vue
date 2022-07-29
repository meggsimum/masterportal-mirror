<script>
import Draw, {createBox} from "ol/interaction/Draw.js";
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {mapActions, mapMutations} from "vuex";
import * as jsts from "jsts/dist/jsts";
import {
  LineString,
  LinearRing,
  Point,
  Polygon,
} from 'ol/geom';

export default {
    name: "GeometryFilter",
    data () {
        return {
            isActive: false,
            buffer: 20,
            isBufferInputVisible: false,
            geometries: [
                {
                    "name": "Fläche",
                    "type": "Polygon"
                },
                {
                    "name": "Rechteck",
                    "type": "Circle"
                },
                {
                    "name": "Kreis",
                    "type": "Circle"
                },
                {
                    "name": "Linie + Puffer",
                    "type": "LineString"
                }
            ],
            selectedGeometry: {
                "name": "Fläche",
                "type": "Polygon"
            }
        };
    },
    watch: {
        selectedGeometry () {
            this.removeInteraction(this.draw);
            this.setDrawInteraction();
            this.isBufferInputVisible = false;
        },
        isActive (val) {
            this.draw.setActive(val);
        },
        buffer (val, oldVal) {
            const jstsGeom = this.ol3Parser.read(this.feature.getGeometry()),
                buffered = jstsGeom.buffer(val - oldVal);

            // convert back from JSTS and replace the geometry on the feature
            this.feature.setGeometry(this.ol3Parser.write(buffered));
            this.$emit("updateFilterGeometry", this.feature.getGeometry());
        }
    },
    created () {
        this.ol3Parser = new jsts.io.OL3Parser();
        this.ol3Parser.inject(
            Point,
            LineString,
            LinearRing,
            Polygon
        );

        this.setLayer();
        this.setDrawInteraction();
    },

    beforeDestroy () {
        this.removeInteraction(this.draw);
        this.removeLayerFromMap(this.layer);
    },

    methods: {
        ...mapActions("Maps", ["addInteraction", "removeInteraction", "addLayer"]),
        ...mapMutations("Maps", ["removeLayerFromMap"]),

        setDrawInteraction () {
            // createBox() and type: 'Circle' return a box instead of a circle geometry
            this.draw = new Draw({
                source: this.layer.getSource(),
                type: this.selectedGeometry.type,
                geometryFunction: this.selectedGeometry.name !== "Rechteck" ? undefined : createBox()
            });

            this.draw.setActive(this.isActive);

            // this.select.on("change:active", this.styleSelectedFeatures);
            this.draw.on("drawend", (evt) => {
                this.feature = evt.feature;
                if (this.selectedGeometry.type === "LineString") {
                    console.log(this.buffer);
                    const jstsGeom = this.ol3Parser.read(this.feature.getGeometry()),
                        buffered = jstsGeom.buffer(this.buffer);

                    this.isBufferInputVisible = true;

                    // convert back from JSTS and replace the geometry on the feature
                    this.feature.setGeometry(this.ol3Parser.write(buffered));
                }
                // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw.html#.createRegularPolygon
                // else if (this.selectedGeometry.name === "Kreis") {
                //     // circle to polygon
                // }
                this.$emit("updateFilterGeometry", this.feature.getGeometry());
            });

            this.draw.on("drawstart", (evt) => {
                this.layer.getSource().clear();
            });

            this.addInteraction(this.draw);
        },

        setLayer () {
            this.layer = new VectorLayer({
                id: "geometry-filter",
                name: "geometry-filter",
                source: new VectorSource(),
                alwaysOnTop: true
            });

            this.addLayer(this.layer);
        }
    }
};

</script>

<template lang="html">
<div>
    <form>
        <div class="mb-3">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" v-model="isActive">
                <label class="form-check-label" for="flexCheckChecked">
                    Gebiets-Filter aktivieren
                </label>
                <div id="emailHelp" class="form-text">Wählen Sie auf der Karte ein Gebiet aus, um nur innerhalb dieses Gebietes zu filtern.</div>
            </div>
        </div>
        <div v-if="isActive" class="mb-3">
            <div class="form-floating">
            <select id="disabledSelect" class="form-select" aria-label="Default select example" v-model="selectedGeometry">
                <option
                    v-for="(geometry, index) in geometries"
                    :key="index"
                    :value="geometry"
                >
                    {{ geometry.name }}
                </option>
            </select>
            <label for="disabledSelect">Wählen Sie eine Geometrie aus.</label>
            </div>
        </div>
        <div v-if="isBufferInputVisible" class="mb-3">
            <label for="exampleInputEmail1" class="form-label">Puffer [m]</label>
            <input type="number" class="form-control" id="exampleInputEmail1" v-model="buffer">
        </div>
    </form>
    <hr>
</div>
</template>

<style lang="scss" scoped>
    form {
        font-size: 16px;
    }

    hr {
        margin-left: -20px;
        margin-right: -20px;
    }

    .form-check {
        label {
            margin-top: 3px;
        }
    }
</style>
