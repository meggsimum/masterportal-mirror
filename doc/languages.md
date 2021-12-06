# Masterportal translation guide

This document describes how to work with languages and translations in the Masterportal. It is intended for beginners, advanced users, and experts.

These are the objectives of the document:

1. Explain how to expand language files and add new languages (beginners)
2. Explain how to use localization in new models (advanced users)
3. Explain how the internationalization system works (experts)

## Background

This section provides background information and common knowledge on working with translations and languages in the Masterportal.

### Technology

The Masterportal uses the [i18next](https://www.i18next.com/) technology for translations.

For advanced users and experts, we recommend reading the short and on-point i18next documentation.

The following i18next plugins are used:

* [i18next-http-backend](https://github.com/i18next/i18next-http-backend) to use language files rather than hard coded translations
* [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) to detect the browser language, use the localStorage, and react to the URL query

An i18next language change is currently broadcasted with this `Backbone.Radio` event: `"i18next#RadioTriggerLanguageChanged"`. i18next is available as global variable (also named `i18next`) and can be accessed in browser consoles via `Backbone.i18next`.

>⚠️ Please mind that Backbone is deprecated and will eventually be replaced with the VueX store.

### Languages

The Masterportal's main development team is seated in Hamburg, Germany. For this reason, the fallback language is currently German. You may change the fallback language within the `config.js` file.

A complete english translation is provided.

### Configuration

i18next's languages are configured in the `config.js` file. See the **[config.js documentation](config.js.md)** for details.

### Language files

Language files are used to store translations by *keys*. These *keys* are used to access translations in-code and in the Masterportal configuration. To work with language files, basic JSON syntax knowledge is required.

For beginners, we recommend a quick look at these JSON guides:

* https://restfulapi.net/json-syntax/
* https://www.w3schools.com/js/js_json_syntax.asp

## Language files

Language files are translation core. To support a language, a separate language file is needed for it. We decided to split translations into two files:

1. common
2. additional

See the **[i18next architecture](i18next.jpeg)** on how these files are used.

### Common language file - `common.json`

The common language file contains all translations used throughout the Masterportal in its standard configuration. This includes common modules as well as the most used menu entries and application logic.

### Additional language file - `additional.json`

The additional language file is used for add-ons (formerly *custom modules*).

## Translation of config.json names

This section describes how to use i18next to translate config.json values

After a best practice scenario, the background mechanisms are explained in detail.

### Best practice scenario

#### Menu

To translate a config.json value, the value itself must be formatted correctly. The formatted value must then be added to the translation files. If the part of the config.json is considered for translations by the Masterportal, the translation will take place. Please mind that only the field `"name"` is considered during translation.

**Translation file common.json:**

```json
{
    "foo": {
        "bar": {
            "exampleMenuTitle": "titulum menu",
            "exampleLayerName": "aliquid",
            "exampleSubjectData": "subject data"
        }
    }
}
```

**Translatable config.json menu part:**

```json
{
    "Portalconfig": {
        "menu": {
            "example": {
                "name": "translate#common:foo.bar.exampleMenuTitle",
                "icon": "bi-list-ul",
                "isInitOpen": false
            }
        }
    }
}
```

The translation key must be prefixed with `"translate#"` and the file name. The structure of such a key is `translate#[filename]:[path.to.key]`, resulting in e.g. `translate#common:foo.bar.exampleMenuTitle`.

The menu is programmed to react to the translation prefix `"translate#"`, and no further action is required.

### Layer tree

The layer tree (de: "Themenbaum") can be translated as well.

>⚠️ **Plate note**: Adding a translation key to a layer tree entry will overwrite any title or name of the service.

If the treeType is `"default"` or `"custom"`, folder names can be specified. In the following example, the tree would show the value for the key `"foo.bar.exampleSubjectData"` instead of "Subject data".

Default translations:

* Baselayer: "Background maps" (de: "Hintergrundkarten")
* Overlay: "Subject data" (de: "Fachthemen")
* 3d-layer: "3D data" (de: "3D Daten")

**Translatable config.json layer tree part:**

```json
{
    "Themenconfig": {
        "Fachdaten": {
            "name": "translate#common:foo.bar.exampleSubjectData",
            "Layer": [
                  {
                    "id": "2128",
                    "name": "translate#common:foo.bar.exampleLayerName"
                  }
            ]
        }
    }
}
```

These possibilities and hierarchy exist:

* `"name": "my special subjects"` is never translated
* `"name": "translate#common:foo.bar.exampleMenuTitle"` is translated if the key exists
* if no name is specified (that is, the field name does not exist), the default translation is applied (see above)

### Tools

Tools (de: "Werkzeuge") can be translated similarly to tools. This includes the menu entry within the "Tools" folder and the tool window's title.

**Translatable config.json tool part:**

```json
{
    "tools": {
        "name": "Tools",
        "icon": "bi-wrench",
        "children": {
            "draw": {
                "name": "translate#common:foo.bar.exampleMenuTitle",
                "icon": "bi-pencil-fill"
            },
        }
    }
}
```

The following possibilities and hierarchy exist:

* `"name": "Draw / Write"` is never translated
* `"name": "translate#common:foo.bar.exampleMenuTitle"` is translated if the key exists
* if no name is specified (that is, the field name does not exist), the name is set by the model.js (in this scenario, `../tools/draw/model.js`)

#### Define tool name in the `model.js`

If the field `"name"` in the `model.js` is filled, it is interpreted as default name, and not translated.

```js
const DrawTool = Tool.extend(/** @lends DrawTool.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        name: "Draw / Write",
        ...
```

To add translation, use the attribute name `"nameTranslationKey"` to provide the key instead.

```js
const DrawTool = Tool.extend(/** @lends DrawTool.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        nameTranslationKey: "common:menu.tools.draw",
        ...
```

## Translation in add-ons

The language files can be found under `./addons/{addon-name}/locales/{language}/additional.json`.

A translation is implemented this way:

```js
i18next.t("additional:modules.tools.example.title"),
```

[See this for an example.](https://bitbucket.org/geowerkstatt-hamburg/addons/src/master/populationRequest/)

## Interesting i18nxt translation functions

### Interpolation

Use dynamic values in your translations.

**Key**

```json
{
    "key": "{{what}} is {{how}}"
}
```

**Example**

```js
i18next.t('key', { what: 'i18next', how: 'great' });
// -> "i18next is great"
```

See the [i18next interpolation documentation](https://www.i18next.com/translation-function/interpolation#basic) for further details.

### Singular / Plural

i18next features automatic recognition of singular and plural forms.

>⚠️ Note: The variable name must be `count`!

**Keys**

```json
{
  "key": "item",
  "key_plural": "items",
  "keyWithCount": "{{count}} item",
  "keyWithCount_plural": "{{count}} items"
}
```

**Example**

```js
i18next.t('key', {count: 0}); // -> "items"
i18next.t('key', {count: 1}); // -> "item"
i18next.t('key', {count: 5}); // -> "items"
i18next.t('key', {count: 100}); // -> "items"
i18next.t('keyWithCount', {count: 0}); // -> "0 items"
i18next.t('keyWithCount', {count: 1}); // -> "1 item"
i18next.t('keyWithCount', {count: 5}); // -> "5 items"
i18next.t('keyWithCount', {count: 100}); // -> "100 items"
```

See the [i18next singular-plural documentation](https://www.i18next.com/translation-function/plurals#singular-plural) for more details.

### Nesting

Nesting allows you to reference other keys within a translation.

**Keys**

```json
{
    "nesting1": "1 $t(nesting2)",
    "nesting2": "2 $t(nesting3)",
    "nesting3": "3",
}
```

**Example**

```js
i18next.t('nesting1'); // -> "1 2 3"
```

See the [i18next nesting documentation](https://www.i18next.com/translation-function/nesting#basic) for more details.

### Formatting

Please read the [i18next formatting documentation](https://www.i18next.com/translation-function/formatting#formatting) regarding this topic.

## Common errors

>You have set a translation key, but instead of the actual translation, the key is visible.

Please check the correct spelling of the key. i18next can't find this key neither in the selected language file nor in the fallback language file.

>You have set a translation key in the config.json, but the translation does not change on language changes.

Please check first whether the module controlled by this part of the config.json has been programmed to react to translations at all.

>Expert hint: The `config.json` is translated initially when the Masterportal starts. For language changes, `i18next.translate` must be used in the code. If not used, the content will permanently remain in the initially active language.


## How to use i18next in production Vue

The following section is a guide on how to integrate i18next into your MP project using Vue.

### Translate in the template
The translation of the values to be displayed can be done directly in the template of a Vue component. For this purpose `$t()` is used. In the following example, the `name` attribute is translated.

ExampleTemplate
```vue
<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="icon"
    >
</template>
```

### Translate in script
To translate the values in the script part of a Vue component, this must be done in the computed property. For this purpose `this.$t()` is used.

```js
 computed: {
    /**
    * Gets the exmaple attributes.
    * @returns {Object} The exmaple attributes.
    */
    example: function () {
        const example = {
            exampleTitle: this.$t("common:foo.bar.exampleTitle"),
            exampleText: this.$t("common:foo.bar.exampleText")
        };

        return example;
    },
 }
```

### Translate to unit tests

i18next provides a test mode for unit tests.
In test mode, no real translation is performed (no files are loaded).
Instead, i18next always responds with the specified key.

For unit tests in the master portal, we use "Chai".
When i18next exits in a component, a mock must be created in the associated unit test.

```js
import {config} from "@vue/test-utils";
config.mocks.$t = key => key;
```


## How to use i18next in production Backbone (Deprecated)

This section is a guide on how to integrate i18next into your Masterportal project using MV*.

### Translate your model

To translate values for your model with i18next, simply set the values using the translation function of i18next. Listening to the `Backbone.Radio` event `"i18next#RadioTriggerLanguageChanged"` allows value changes to the currently chosen language at run-time.

**ExampleModel:**

```js
const ExampleModel = Backbone.Model.extend(/** @lends ExampleModel.prototype */ {
    defaults: {
        currentLng: "",
        exampleTitle: "",
        exampleText: ""
    },
    /**
     * @class ExampleModel
     * @extends Backbone.Model
     * @memberof Example
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            exampleTitle: i18next.t("common:foo.bar.exampleTitle"),
            exampleText: i18next.t("common:foo.bar.exampleText")
        });
    }
});

export default ExampleModel;
```

#### Listen to your model

If set up properly, the view listens to model changes and renders the template when required. The Masterportal uses *Underscore.js* for templating. To show how this SHOULD be implemented, the model from above is used to set up the MV* in the following example.

**ExampleTemplate:**

```html
<!DOCTYPE html>
<div class="title"><%= exampleTitle %></div>
<div class="text"><%= exampleText %></div>
```

**ExampleView:**

```js
import ExampleTemplate from "text-loader!./template.html";
import ExampleModel from "./model";

const ExampleView = Backbone.View.extend(/** @lends ExampleView.prototype */{
    /**
     * @class ExampleView
     * @extends Backbone.View
     * @memberof Example
     * @constructs
     * @listens ExampleModel#changeExampleText
     */
    initialize: function () {
        this.model = new ExampleModel();

        this.listenTo(this.model, {
            "change:currentLng": this.render
        });

        this.render();
    },

    /**
     * renders the view
     * @param {ExampleModel} model the model of the view
     * @param {Boolean} value the values of the changes made to the model
     * @returns {Void}  -
     */
    render: function () {
        const template = _.template(ExampleTemplate),
            params = this.model.toJSON();

        this.$el.html(template(params));

        return this;
    }
});

export default ExampleView;
```

## Unit Tests

i18next provides a test mode for unit testing. In test mode, no real translation will be provided, and no files are loaded. Instead, i18next simply responds with the given key.

For Masterportal unit testing, `chai` is used as an assertion library.

To set up i18next for unit testing, initialize it in the language `"cimode"`. This sets i18next to test mode.

```js
before(function () {
    i18next.init({
        lng: "cimode",
        debug: false
    });
    model = new Model();
});
```
