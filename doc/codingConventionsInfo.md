# Additional information on the coding conventions

Explanations and examples are given for some points mentioned in the [coding conventions](./codingConventions.md) below.

---

### Section A

#### A.1.6

Babel currently does not translate TPL files.

---

#### A.4.3

These two examples illustrate how to write JSDoc comment blocks.

```js
/**
* This function does some things that are explained right here.
* @returns {Void}
*/
functionWithoutParamsAndNoReturn: function () {
    ...
}
```

```js
/**
* This function does some things that are explained right here.
* @param {String} param1 InputString.
* @returns {String} ConcatenatedString
*/
functionWithParamsAndReturn: function (param1) {
    return param1 + "foobar";
}
```

---

#### A.4.4

*Example for the `initialize()` function:*

```js
defaults: {
    channel: Radio.channel("Alert"),
    category: "alert-info",
    isDismissable: true,
    isConfirmable: false,
    position: "top-center",
    message: "",
    animation: false
},

/**
 * @class AlertingModel
 * @extends Backbone.Model
 * @memberof Alerting
 * @constructs
 * @property {Radio.channel} channel=Radio.channel("Alert") Radio channel for communication
 * @property {String} category="alert-info" Category of alert. bootstrap css class
 * @property {Boolean} isDismissable=true Flag if alert has a dismissable button
 * @property {Boolean} isConfirmable=false Flag if alert has to be confirmed to close
 * @property {String} position="top-center" The positioning of the alert. Possible values "top-center", "center-center"
 * @property {String} message="" The message of the alert
 * @property {Boolean} animation=false Flag if Alert is animated by means of fading out
 * @fires Alerting#render
 * @fires Alerting#changePosition
 * @listens Alerting#RadioTriggerAlertAlert
 */
initialize: function () {
    this.listenTo(this.get("channel"), {
        "alert": this.setParams
    }, this);
},
```

*Example for template instantiation:*

```js
/**
 * @member AlertingTemplate
 * @description Template used to create the alert message
 * @memberof Alerting
 */
template: _.template(AlertingTemplate),
```

---

#### A.4.5

*Comment on inheritance:*

```js
    const AlertingModel = Backbone.Model.extend(/** @lends AlertingModel.prototype */{
```

---

#### A.4.6

Namespace definition.

*Example namespace Alerting in Root:*

```js
/**
 * @namespace Alerting
 * @description Alerting system that responds to given events.
 * Used to have the same alert all over the portal.
 */
```

*Example namespace ModelList as Core subfolder:*

```js
/**
 * @namespace ModelList
 * @memberof Core
 * @description List module to gather all item models
 */
```

*Example nested namespace:*

```js
/**
 * @event Core.ModelList.Layer#changeIsSelected
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSelected has changed
 */
```

*Example module namespace with event of namespace Alerting:*
```js
/**
 * @event Alerting#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */
```

---

#### A.4.7

Event definition.

*Example: `Radio.trigger("Channel", "Event");`*
```js
/**
 * @event Namespace#RadioTriggerChannelEvent
 * @description FooBar.
 * @example Radio.trigger("Channel", "Event")
 */
```

*Example: `Radio.trigger("Channel", "EventWithData", data);`*
```js
/**
 * @event Namespace#RadioTriggerChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @example Radio.trigger("Channel", "Event", data)
 */
```

*Example: `Radio.request("Channel", "Event");`*
```js
/**
 * @event Namespace#RadioRequestChannelEvent
 * @description FooBar.
 * @returns {*} - Response of this event
 * @example Radio.request("Channel", "Event")
 */
```

*Example: `Radio.request("Channel", "EventWithData", data);`*
```js
/**
 * @event Namespace#RadioRequestChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @returns {*} - Response of this evennt
 * @example Radio.request("Channel", "Event", data)
 */
```

*Example: `Model.trigger("myTrigger");`*
```js
/**
 * @event Namespace#MyTrigger
 * @description FooBar.
 */
```

*Example: `Model.trigger("myTriggerWithData", data);`*
```js
/**
 * @event Namespace#MyTriggerWithData
 * @param {*} data Data to be sent with the event
 * @description FooBar.
 */
```

*Example: `this.listenTo(this, { "change:attributeOne": this.doSomething });`*
```js
/**
 * @event Namespace#changeAttributeOne
 * @description FooBar.
 */
```

---

#### A.5.1

Example for testable and untestable functions.

```js
function testableFunction (uebergabeParameter) {
    let rueckgabeParameter = "Hello " + uebergabeParameter;

    return rueckgabeParameter
}

const arr = [];
function untestableFunction (param) {
    setTimeout(() => {
        arr.push(param);
    }, 1000);
}
```

---

#### A.5.2

For more information on unit tests in Vue, refer to [the Vue unit test documentation](./unitTestVue.md).

Tests employ the libraries **[Chai](https://www.chaijs.com/)** and **[Mocha](https://mochajs.org/)**.

---

#### A.6.2

Extend the `.md` file documentation by following these instructions.

* For new configuration parameters that do not directly influence the Masterportal UI and displayed layers, or on changes to such existing parameters, extend the file **[config.js.md](./config.js.md)**.
* For new configuration parameters regarding the Masterportal UI, or on changes to such existing parameters, extend the **[config.json.md](./config.json.md)**.
* The following parameters are mandatory for documenting configuration parameters:
    |Name|Required|Type|Default|Description|Expert|
    |-|-|-|-|-|-|
    The row `Expert` only applies to the **[config.json.md](./config.json.md)**.
* Each parameter in a `.md` file ends on a horizontal separation line produced by e.g. `***` or `---`.
* The heading to be used depends on the parameter nesting. The top level starts with `#`, the next level with `##`, and so on. Please mind that Markdown only supports up to six chapter levels.
* Configuration parameters describing an object containing further parameters are modelled in separate chapters and are each linked and described.
* For complex configuration parameters, an example configuration is required.
* Also extend the files **[services.json.md](./services.json.md)**, **[rest-services.json.md](./rest-services.json.md)**, and **[style.json.md](./style.json.md)**, if you add or change parameters to these global configuration files.

For a more formal definition of the **[config.json.md](./config.json.md)** requirements, see [Masterportal configuration parser](https://bitbucket.org/geowerkstatt-hamburg/mpconfigparser/src/master/README.md).

*Nesting in .json is modeled with the amount of #*

```
    # config.json
    .
    .
    .

    ## Portalconfig
```

*Parameters are nested when describing an object themselves:*
```
    ## Portalconfig
    |Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
    |----|-------------|---|-------|------------|------|
    |controls|nein|[controls](#markdown-header-portalconfigcontrols)||Description text.|false|
    ***

    ### Portalconfig.controls

```

*Example of a complex configuration*
```
    "osm": {
        "minChars": 3,
        "serviceId": "10",
        "limit": 60,
        "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
        "classes": "place,highway,building,shop,historic,leisure,city,county"
    }
```

---

#### A.6.4

On changing, refactoring, or deleting a parameter:

* Note "Deprecated in [next major release]" within the parameter's documentation.
* Mark the old parameter's code as deprecated by adding "@deprecated in [next major release]" within the JSDoc comment.

For example, the following annotations mark the parameter "Baumtyp" within the `config.json` and code as deprecated:

```md
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Baumtyp|nein|enum["light", "default", "custom"]|"light"|Deprecated in 3.0.0. Use "treeType" instead.|false|
```

```js
/**
 * this.updateTreeType
 * @deprecated in 3.0.0
 */
attributes = this.updateTreeType(attributes, response);
...
/**
 * Update the preparsed treeType from attributes to be downward compatible.
 * @param {Object} attributes Preparased portalconfig attributes.
 * @param {Object} response  Config from config.json.
 * @returns {Object} - Attributes with mapped treeType
 * @deprecated in 3.0.0. Remove whole function and call!
 */
updateTreeType: function (attributes, response) {
    if (response.Portalconfig.treeType !== undefined) {
        attributes.treeType = response.Portalconfig.treeType;
    }
    else if (response.Portalconfig.Baumtyp !== undefined) {
        attributes.treeType = response.Portalconfig.Baumtyp;
        console.warn("Attribute 'Baumtyp' is deprecated. Please use 'treeType' instead.");
    }
    else {
        attributes.treeType = "light";
    }
    return attributes;
},
```

---

#### A.7.1

The library [i18next](https://www.i18next.com/) is used for internationalization.

---

#### A.8.3

For more information of versions, read the [versioning documentation](./versioning.md).

For each pull request, add an entry to the chapter "Unreleased" of the [CHANGELOG](../CHANGELOG.md) file. Avoid technical jargon. The changelog is supposed to be readable by both users and developers.

---

### Section B (optional)

#### B.3.1

```js
// code example for generating simple getters
import state from "./state";
import {generateSimpleMutations} from "~generators";

const mutations = {
    ...generateSimpleMutations(state),
```

----

#### B.4.2

* [mapState documentation](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)
* [mapGetters documentation](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper)
* [mapMutations documentation](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components)
* [mapActions documentation](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components)

---

#### B.5.4

```html
<style lang="scss" scoped>
    @import "~variables";
</style>
```

---

#### B.6

An example simply displaying "My First Alert Message":

```js
import store from "masterportal/src/app-store/index";
store.dispatch("Alerting/addSingleAlert", "My First Alert Message.");
```

On phrasing, please use the following examples as a guideline.

|Positive example|Negative example|
|-|-|
|Further information on this topic could not be loaded.|CSW request failed|
|Please enter your password|You forgot to enter your password|
