import AddWMS from "./addWMS/components/AddWMS.vue";
import BufferAnalysis from "./bufferAnalysis/components/BufferAnalysis.vue";
import CompareFeatures from "./compareFeatures/components/CompareFeatures.vue";
import ContactFormular from "./contact/components/ContactFormular.vue";
import CoordToolkit from "./coordToolkit/components/CoordToolkit.vue";
import DrawItem from "./draw/components/DrawItem.vue";
import FileImport from "./fileImport/components/FileImport.vue";
import FilterGeneral from "./filterGeneral/components/FilterGeneral.vue";
import GetFeatureInfo from "./gfi/components/GetFeatureInfo.vue";
import LayerClusterToggler from "./layerClusterToggler/components/LayerClusterToggler.vue";
import LayerSlider from "./layerSlider/components/LayerSlider.vue";
import MeasureInMap from "./measure/components/MeasureInMap.vue";
import PrintMap from "./print/components/PrintMap.vue";
import RoutingTemplate from "./routing/components/RoutingTemplate.vue";
import SaveSelection from "./saveSelection/components/SaveSelection.vue";
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
import SearchByCoord from "./searchByCoord/components/SearchByCoord.vue";
import SelectFeatures from "./selectFeatures/components/SelectFeatures.vue";
import StyleVT from "./styleVT/components/StyleVT.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import WfsSearch from "./wfsSearch/components/WfsSearch.vue";

/**
 * User type definition
 * @typedef {Object} ToolsState
 * @property {Object} componentMap contains all tool components
 * @property {Object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        addWMS: AddWMS,
        bufferAnalysis: BufferAnalysis,
        compareFeatures: CompareFeatures,
        contact: ContactFormular,
        coordToolkit: CoordToolkit,
        draw: DrawItem,
        fileImport: FileImport,
        gfi: GetFeatureInfo,
        filterGeneral: FilterGeneral,
        layerClusterToggler: LayerClusterToggler,
        layerSlider: LayerSlider,
        measure: MeasureInMap,
        print: PrintMap,
        routing: RoutingTemplate,
        saveSelection: SaveSelection,
        scaleSwitcher: ScaleSwitcher,
        searchByCoord: SearchByCoord,
        selectFeatures: SelectFeatures,
        styleVT: StyleVT,
        supplyCoord: SupplyCoord,
        wfsSearch: WfsSearch
    },
    configuredTools: []
};

export default state;
