# Vue.js Add-ons

The Masterportal offers a mechanism to inject your own developments into the sources, without them becoming a part of the Masterportal repository. See **[setting up the development environment](setupDev.md)** for more information.

An add-on in itself is identically programmed as a native module is. For an example, see **[Tutorial 01: Creating a new module (Scale Switcher)](vueTutorial.md)**. However, an add-on lives in another repository and thus allows separate management.

All add-ons to be added are placed in the folder `addons` found at Masterportal root level. Any number of such add-ons may be configured in a portal's **[config.js](config.js.md)**. Add-ons may bring their own `package.json` file to specify further dependencies.

Please adhere to the following structure, in this example adding a tool (MyAddon1) and a GFI theme (MyGfiTheme):

## Add-on folder structure

### File system example

Only files related to add-ons must be placed in the `addons` folder.

```
addons
|-- myAddon1
|    index.js
|   |-- components
|	|   |-- MyAddOn1.vue
|   |   |-- ...
|	|-- store
|   |   |-- actionsMyAddOn1.js
|   |   |-- gettersMyAddOn1.js
|   |   |-- indexMyAddOn1.js
|   |   |-- mutationsMyAddOn1.js
|   |   |-- MyAddOn1.js // the equivalent of index.js
|   |
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- tests
|	|   |-- end2end
|   |	|   |-- MyAddOn1.e2e.js
|	|   |-- unit
|   |	|   |-- components
|   |   |	|   |-- MyAddOn1.spec.js
|   |	|   |-- store
|   |   |	|   |-- actionsMyAddOn1.spec.js
|   |   |	|   |-- gettersMyAddOn1.spec.js
|   |   |	|   |-- mutationsMyAddOn1.spec.js
|   |
|   |-- package.json

|-- myGfiTheme
|   index.js
|   |-- components
|	|   |-- MyGfiTheme.vue
|   |   |-- ...
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- tests
|	|   |-- end2end
|   |	|   |-- MyGfiTheme.e2e.js
|	|   |-- unit
|   |	|   |-- components
|   |   |	|   |-- MyGfiTheme.spec.js
|   |
|   |-- package.json

|-- myGFIThemesFolder
|   |-- myGFISubFolder
|   |   index.js
|   |   |-- components
|   |   |   |-- MyGfiTheme.vue
|   |   |   |-- ...
|   |   |-- locales
|   |   |   |-- de
|   |   |   |   |-- additional.json
|   |   |   |-- en
|   |   |   |   |-- additional.json
|   |   |
|   |   |-- doc
|   |   |   |-- config.json.md
|   |   |
|   |   |-- tests
|   |   |   |-- end2end
|   |   |   |   |-- MyGfiTheme.e2e.js
|   |   |   |-- unit
|   |   |   |   |-- components
|   |   |   |   |   |-- MyGfiTheme.spec.js
|   |   |
|   |   |-- package.json

|-- myControl
|   index.js
|   |-- components
|	|   |-- MyControl.vue
|   |   |-- ...
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- tests
|	|   |-- end2end
|   |	|   |-- MyControl.e2e.js
|	|   |-- unit
|   |	|   |-- components
|   |   |	|   |-- MyControl.spec.js
|   |
|   |-- package.json

|-- myControlFolder
|   |-- myControlSubFolder
|   |   index.js
|   |   |-- components
|   |   |   |-- MyControl.vue
|   |   |   |-- ...
|   |   |-- locales
|   |   |   |-- de
|   |   |   |   |-- additional.json
|   |   |   |-- en
|   |   |   |   |-- additional.json
|   |   |
|   |   |-- doc
|   |   |   |-- config.json.md
|   |   |
|   |   |-- tests
|   |   |   |-- end2end
|   |   |   |   |-- MyControl.e2e.js
|   |   |   |-- unit
|   |   |   |   |-- components
|   |   |   |   |   |-- MyControl.spec.js
|   |   |
|   |   |-- package.json

|-- myJavascript
|   index.js
|   myJavascript.js
|   mySecondJavascript.js
|	|-- locales
|	|   |-- de
|   |	|   |-- additional.json
|	|   |-- en
|   |	|   |-- additional.json
|   |
|	|-- doc
|	|   |-- config.json.md
|   |
|	|-- tests
|	|   |-- end2end
|   |	|   |-- myJavascript.e2e.js
|	|   |-- unit
|   |   |	|-- myJavascript.spec.js
|   |
|   |-- package.json

```

The entry point of each add-on must be a file named `index.js` on add-on folder root level.

### Configuration file

Within the add-ons folder, a configuration file `addonsConf.json` must exist. This file is to contain JSON that has the add-on's name as key; i.e., an add-on in `addons/myAddOn1` would have `myAddOn1` as key.

#### `addonsConf.json` example

Matching the example above, this would be a fitting configuration.

This types of add-ons are supported:
* Tools (`"type": "tool"`)
* GFI themes (`"type": "gfiTheme"`)
* Controls (`"type": "control"`)
* Javascript (`"type": "javascript"`)

All entries to the `addonsConf.json` defined by an object are expected to be written in Vue or pure javascript. The deprecated Backbone add-ons are always defined by a string.

By default, an add-on's key is the name of its folder. By using the parameter `path` you may specify any other path. This way, you may group multiple add-ons in a folder.

```json
{
  "myAddOn1": {
    "vue": true
  },
  "myGfiTheme": {
    "type": "gfiTheme"
  },
  "anotherGFITheme": {
    "type": "gfiTheme",
    "path": "myGFIThemesFolder/myGFISubFolder"
  }
  },
  "myControl": {
    "type": "control"
  },
  "anotherControl": {
    "type": "control",
    "path": "myControlFolder/myControlSubFolder"
  },
  "myJavascript": {
    "type": "javascript"
  }
}
```

Only files related to `add-ons` may end up in this folder.

For additional required dependencies not included in the Masterportal, add a separate minimal `package.json` file.

```json
{
  "name": "exampleAddon",
  "version": "1.0.0",
  "description": "I'm an example! I can say hello world.",
  "dependencies": {
    "hello": "^0.3.2"
  }
}
```

## Add-on example

### Create files

The add-on example shall have the name *VueAddOn* with entry point file `index.js`. The component `VueAddOn.vue` is placed in the folder `components`. From this, the following file structure results:

```
myMasterPortalFolder/
    addons/
        vueAddOn/
            index.js
            components/
                VueAddOn.vue
            store
                VueAddOn.js
    devtools/
    doc/
    [...]
```

### Example store

```js
// myMasterPortalFolder/addons/VueAddon/store/VueAddon.js

import GenericTool from "../../../src/modules/tools/indexTools";
import composeModules from "../../../src/app-store/utils/composeModules";
import getters from "./gettersVueAddon";
import mutations from "./mutationsVueAddon";
import actions from "./actionsVueAddon";
import state from "./stateVueAddon";

export default composeModules([GenericTool, {
    namespaced: true, // mandatory
    state,
    mutations,
    actions,
    getters
}]);
```

The contents `state`, `mutations`, `actions`, and `getters` may be placed in separate files or can alternatively be written directly to the store file. Please mind that setting `namespaced: true` is mandatory.

```vue
// myMasterPortalFolder/addons/vueAddon/components/VueAddon.vue

<script>
import Tool from "../../../src/modules/tools/Tool.vue";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersVueAddon";
import mutations from "../store/mutationsVueAddon";

export default {
    name: "VueAddon",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/VueAddon", Object.keys(getters))
    },
    created () {
        this.$on("close", this.close);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.initialize();
        if (this.isActive) {
            this.setActive(true);
        }
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapActions("Tools/VueAddon", [
            "initialize"
        ]),
        ...mapMutations("Tools/VueAddon", Object.keys(mutations)),

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {
            this.setActive(false);

            // TODO replace trigger when Menu is migrated
            // set the backbone model to active false for changing CSS class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            // else the menu-entry for this tool is always highlighted
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.VueAddon.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="vue-addon"
            >
                {{ $t("additional:modules.tools.vueAddon.content") }}
            </div>
        </template>
    </Tool>
</template>
```

### Writing the `index.js` file

Within the `index.js` file, all components (Vue components, store, translations, ...) are aggregated and exported via a single entry point.

Theoretically, the entry point may be configured within the `addonsConf.json` file arbitrarily. However, it is required to be `index.js`, since webpack will not load the module correctly else.

Please check that all components are imported correctly, and not in a `.default` one level deeper in the object. This may e.g. happen if you use `import * as VueAddonComponent from" ./components/VueAddon.vue ";` to import the component.

```js
// myMasterPortalFolder/addons/vueAddon/index.js

import VueAddonComponent from "./components/VueAddon.vue";
import VueAddonStore from "./store/VueAddon";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: VueAddonComponent,
    store: VueAddonStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
```

### Creating the `addonsConf.json`

```json
// myMasterPortalFolder/addons/addonsConf.json

{
  "vueAddon": {
    "type": "tool"
  }
}
```

### Activate the add-on example in the portal's `config.js`

```js
// myMasterPortalFolder/config.js
const Config = {
    // [...]
    addons: ["VueAddon"],
    // [...]
};
```

### Configure the add-on example as tool in the portal's `config.json` for it to appear in the menu

```json
// myMasterPortalFolder/config.json
...
    "tools": {
        "name": "Tools",
        "icon": "bi-wrench",
        "children": {
           "vueAddon": {
                "name": "translate#additional:modules.tools.vueAddon.title",
                "icon": "bi-list-ul"
          },
```

### index.js for pure javascript

```js
// myMasterPortalFolder/addons/myJavascript/index.js

import myJavascript from "./myJavascript";
import mySecondJavascript from "./mySecondJavascript";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    myJavascript,
    mySecondJavascript,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
```


### Write JSDoc

For this, create a file `namespaces.js` in the `jsdoc` folder and **add** `Addons` as `@memberof`.

```js
/**
 * @namespace ExampleAddon
 * @memberof Addons
 */
```

In the file `model.js`, `@memberOf` must be prefixed with `Addons.` for this to work correctly.

```js
/**
* @class exampleAddon
* @extends Tool
* @memberof Addons.ExampleAddon
* @constructs
*/
```
