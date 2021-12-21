# Vue tutorial: Creating a new *ScaleSwitcher* tool

This is a step-by-step instruction for creating a new tool based on [Vue](https://vuejs.org/) and [Vuex](https://vuex.vuejs.org/).

## Example requirement

A tool to control the map scale is needed. Scales are to be chosen from a drop-down menu. The map must react on selections by setting the appropriate zoom level. The tool is also supposed to react on scale changes from other sources (e.g. the zoom buttons) and update the drop-down menu accordingly.

## Creating a new tool

Switch to the folder `src/modules/tools` and create a new folder. The folder name should indicate the nature of the tool - e.g. `scaleSwitcher`. Create folders `components` and `store` in that folder, and the required files as shown in the example file tree below.

>💡 Hint: Testing is not part of this guide, but essential to merge a pull request. See our [testing documentation](testing.md) for more information.

```
src
|-- modules
|   |-- tools
|   |   |-- scaleSwitcher
|   |   |   |-- components
|   |   |	|   |-- ScaleSwitcher.vue
|   |   |   |   |-- ...
|   |   |	|-- store
|   |   |   |   |-- actionsScaleSwitcher.js
|   |   |   |   |-- constantsScaleSwitcher.js (not required in this example)
|   |   |   |   |-- gettersScaleSwitcher.js
|   |   |   |   |-- indexScaleSwitcher.js
|   |   |   |   |-- mutationsScaleSwitcher.js
|   |   |   |   |-- stateScaleSwitcher.js
|   |   |   |
|   |   |	|-- tests
|   |   |	|   |-- end2end
|   |   |   |	|   |-- ScaleSwitcher.e2e.js
|   |   |	|   |-- unit
|   |   |   |	|   |-- components
|   |   |   |   |	|   |-- ScaleSwitcher.spec.js
|   |   |   |	|   |-- store
|   |   |   |   |	|   |-- actionsScaleSwitcher.spec.js
|   |   |   |   |	|   |-- gettersScaleSwitcher.spec.js
|   |   |   |   |	|   |-- mutationsScaleSwitcher.spec.js
```

## Creating the ScaleSwitcher.vue

Open `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue` and create the Vue component as a [single file component](https://vuejs.org/v2/guide/single-file-components.html). The `Tool` component should be used here. It encompasses rendering and window (or sidebar) behavior that can be re-used in each tool.

```vue
<script>
import ToolTemplate from "../../ToolTemplate.vue";

export default {
    name: "ScaleSwitcher",
    components: {
        ToolTemplate
    }
};
</script>

<template lang="html">
</template>

<style lang="scss">
</style>
```

## Register the *ScaleSwitcher* component

Open `src/modules/tools/stateTools.js`, import the *ScaleSwitcher* and add it to the component map. The *ToolManager* (`src/modules/tools/ToolManager.vue`) initializes the component and loads the *ScaleSwitcher* configuration from the `config.json`, making it available in its state. The paths `configJson.Portalconfig.menu.scaleSwitcher` and `configJson.Portalconfig.menu.tools.children.scaleSwitcher` will be searched for *ScaleSwitcher* configuration. See the [config.json documentation](config.json.md). The *ToolManager* is part of the *MapRegion's* template. It will only be created when the [*v-if* directive](https://vuejs.org/v2/api/#v-if) finds the `config.json` has become part of the global state.

```js
import ScaleSwitcher from "./scaleSwitcher/components/ScaleSwitcher.vue";
// ... import more tools

/**
 * User type definition
 * @typedef {object} ToolsState
 * @property {object} componentMap contains all tool components
 * @property {object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        scaleSwitcher: ScaleSwitcher
        // ... more tools
    },
    configuredTools: []
};

export default state;
```

## Defining state

[Vuex state](https://vuex.vuejs.org/guide/state.html) is defined in the `modules/tools/scaleSwitcher/store/stateScaleSwitcher.js` file.

```js
const state = {
    // mandatory
    active: false,
    id: "scaleSwitcher",
    // mandatory defaults for config.json parameters
    name: "common:menu.tools.scaleSwitcher",
    icon: "bi-arrows-angle-expand",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
```

## Defining getters

Add [VueX getters](https://vuex.vuejs.org/guide/getters.html#getters) to the `modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js`. For simple getters that only retrieve state, the generator function `generateSimpleGetters` is used.

```js
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import scaleSwitcherState from "./stateScaleSwitcher";

const getters = {
    /**
     * Returns an object of simple getters for a state object, where
     * simple means that they will just return an entry for any key.
     * For example, given a state object {key: value}, an object
     * {key: state => state[key]} will be returned.
     * This is useful to avoid writing basic operations.
     * @param {object} state state to generate getters for
     * @returns {object.<string, function>} object of getters
     */
    ...generateSimpleGetters(scaleSwitcherState)

    // NOTE overwrite (or create additional) getters here if you need special behavior in them
};

export default getters;
```

## Defining state mutations

Add [Vuex mutations](https://vuex.vuejs.org/guide/mutations.html#mutations) to the `modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js`. For simple mutations that only write state, the generator function `generateSimpleMutations` is used.

```js
import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import state from "./stateScaleSwitcher";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(state)

     // NOTE overwrite (or create additional) mutations here if you need special behavior in them
};

export default mutations;
```

## Defining actions

[Vuex actions](https://vuex.vuejs.org/guide/actions.html#actions) can be added to the `modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js`. The *ScaleSwitcher* does not need any actions.`setToolActiveByConfig` is controlled globally by the *ToolManager*.

- The action `setToolActiveByConfig` sets a tool's value "active" to `true`, which results in rendering the tool. See property `active` in the *Tool.vue*.

```js
const actions = {
    // NOTE write actions here if you need them
};

export default actions;
```

### Setting up the store/index file

Open the file `src/modules/tools/scaleSwitcher/store/indexScaleSwitcher.js`. Default export the previously created state, getters, mutations, and actions as an object. This represents a Vuex store, and is pluggable to another Vuex store as a module.

>💡 The `namespaced: true` has to be set by convention. This prevents naming conflicts stores with modules.

```js
import mutations from "./mutationsScaleSwitcher";
import actions from "./actionsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateScaleSwitcher";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
```

## Add the Vuex module to the global store

Open `src/modules/tools/indexTools.js`, import `src/modules/tools/scaleSwitcher/store/indexScaleSwitcher.js`, and register it to the Vuex tool store as a *module*.

```js
import state from "./stateTools";
import getters from "./gettersTools";
import mutations from "./mutationsTools";
import actions from "./actionsTools";
import ScaleSwitcher from "./scale/store/indexScaleSwitcher";
// ... import further tools

export default {
    namespaced: true,
    modules: {
        ScaleSwitcher
        // ... further tools
    },
    state,
    getters,
    mutations,
    actions
};
```

## Use getters as computed properties in the ScaleSwitcher.vue

Import the vuex helper function `mapGetters` in the `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue`, and the *ScaleSwitchers* getters. All getter keys of the *ScaleSwitcher* and the Vuex *Map* module getters `scale` and `scales` are added. For `scale`, a setter is provided. Using `scale`, the current *Map* scale can be retrieved, and `scales` represents all available *Map* scales.

```js
import ToolTemplate from "../../ToolTemplate.vue";
import {mapGetters} from "vuex";
import getters from "../store/gettersScaleSwitcher";

    ...
    computed: {
            ...mapGetters("Tools/ScaleSwitcher", Object.keys(getters)),
            ...mapGetters("Map", ["scales"]),
            scale: {
                get () {
                    return this.$store.state.Map.scale;
                },
                set (value) {
                    this.$store.commit("Map/setScale", value);
                }
            }
        },
    ...
```

## Use mutations as methods in the ScaleSwitcher.vue

Import the vuex helper function `mapMutations` in the `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue`, and the *ScaleSwitcher* mutations. All mutation keys of the *ScaleSwitcher* are added.

```js
import ToolTemplate from "../../ToolTemplate.vue";
import {mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";

    ...
    methods: {
        ...mapMutations("Tools/ScaleSwitcher", Object.keys(mutations)),
    },
    ...
```

## Closing the *ScaleSwitcher* window

Open the `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue` and implement the lifecycle hook `created`. In this function, a `close` listener is added, listening to the *Tool* event `close` fired with the `emit` function, and calls its local method `close` as a reaction. This method sets the state variable `active` to `false`.

>⚠️ WARNING: Since the Masterportal core is currently still implemented in Backbone, the associated Backbone model must be deactivated as a final step.

```js
    ...
    created () {
        this.$on("close", this.close);
    },
    ...
    methods: {
        ...
        close () {
                this.setActive(false);

                // set the backbone model to active=false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
                const model = Radio.request("ModelList", "getModelByAttributes", {id: this.$store.state.Tools.ScaleSwitcher.id});

                if (model) {
                    model.set("isActive", false);
                }
        }
    },
    ...
```

## Writing the ScaleSwitcher.vue template

In `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue`, the template is yet to be defined. The *ScaleSwitchers* HTML is generated from this, and belongs to a nested template child of the *Tool*.

- The nested template defines the *ScaleSwitcher* contents to the *Tool's* v-slot toolBody: `<template v-slot:toolBody> `
- The required parameters are forwarded to the tool
- The outher div needs a unique `id` and the [*v-if* directive](https://vuejs.org/v2/api/#v-if) `"active"`. This ensures the contents are only rendered when `active` is `true`.
- In a [*v-for* directive](https://vuejs.org/v2/api/#v-for) the `option` elements are created from the available `scales`.

```html
<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div id="scale-switcher" v-if="active">
                <label
                    for="scale-switcher-select"
                    class="col-md-5 col-form-label"
                >
                    Scale
                </label>
                <div class="col-md-7">
                    <select
                        id="scale-switcher-select"
                        v-model="scale"
                        class="font-arial form-select form-select-sm float-start"
                    >
                        <option
                            v-for="(scaleValue, i) in scales"
                            :key="i"
                            :value="scaleValue"
                        >
                            1:{{ scaleValue }}
                        </option>
                    </select>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>
```

## Defining *scss* styling rules

Within the `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue*`, styles can be added to the `style` tag. Note that the `css/variables.scss` offers a set of predefined colors and values for usage in all components.

```scss
<style lang="scss" scoped>
    @import "~variables";

    label {
        margin-top: 7px;
    }

    #scale-switcher-select {
        border: 2px solid $secondary;
    }
</style>
```

## Reacting to scale changes

Within the `modules/tools/scaleSwitcher/components/ScaleSwitcher.vue` template, add a change listener to the `select` element calling the `setResolutionByIndex` method.

```html
<select
    id="scale-switcher-select"
    class="font-arial form-select form-select-sm float-start"
    @change="setResolutionByIndex($event.target.selectedIndex)"
>
```

The *Map* offers a [Vuex action](https://vuex.vuejs.org/guide/getters.html#getters) `setResolutionByIndex`. Import the Vuex helper function `mapActions` for easy access.
Calling it will set the map's resolution to a new value.

```js
import {mapGetters, mapActions, mapMutations} from "vuex";

    ...
    methods: {
        ...mapActions("Map", ["setResolutionByIndex"]),
        ...
    }
    ...
```

## Internationalization

Labels should be available in multiple languages. For this, create localization keys in the translation files `locales/[de/en]/common.json`. Read the [internationalization documentation](languages.md) for more details.

```js
"modules": {
    "tools": {
        "scaleSwitcher": {
            "label": "Scales"
        },
        ... // further translations
```

The value can be accessed directly in the template by using the globally available `$t` function.

```html
<label
    for="scale-switcher-select"
    class="col-md-5 col-form-label"
>
    {{ $t("modules.tools.scaleSwitcher.label") }}
</label>
```

## config.json tool configuration

To make the tool usable within a portal, it has to be configured in the portal's `config.json`.

```json
{
    "tools": {
        "name": "Tools",
        "icon": "bi-wrench",
        "children": {
            "scaleSwitcher": {
                "name": "translate#common:menu.tools.scaleSwitcher",
                "icon": "bi-arrows-angle-contract",
                "renderToWindow": true
            }
        }
    }
}
```

The tool's name translation has to be added to the `locales/[de/en]/common.json` files.

```json
{
    "common": {
        "menu": {
            "tools": {
                "scaleSwitcher": "Switch scale"
            }
        }
    }
}
```
