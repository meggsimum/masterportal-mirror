# Coding conventions

## Introduction

As developer, you're motivated to write your code not only fully functional, but as sustainable as possible. This encompasses a wide range of properties based on the "Clean Code" principles - which will hold true for your code.

To decide as objectively as possible whether your code will pass its pull request, we're using a linter and defined a set of function.

For the linter, we use **[ESLint](https://eslint.org/)**, with its configuration file **[.eslintrc](../.eslintrc)** included in the repository. On each push, the linter and unit tests will run automatically. Should an error occur, the push is prevented.

Our conventions are divided into two parts. Any violation of a section A convention does result in a pull request declined. Section B covers guidelines. Compliance with those improve the reusability and maintainability of the code. While not mandatory, please consider following these rules, too.

## Conventions

### Section A

All the following rules must hold.

#### A.1 Linter and functionality

* A.1.1 The code works on Edge, Chrome, and Firefox.
* A.1.2 The code works on the mobile view of the browsers mentioned in A.1.1.
* A.1.3 The linter is active.
* A.1.4 The linter detects no errors.
* A.1.5 Files are encoded `UTF-8`.
* A.1.6 Backbone: No arrow functions are used in templates.

---

#### A.2 Packages and libraries

* A.2.1 The code uses the frameworks and libraries set by *Geowerkstatt*; they are not bypassed.
* A.2.2 No methods of *Underscore.js* are in use, except for calls to `_.template()`.
* A.2.3 No redundant packages are installed.
* A.2.4 JQuery is only to be used in combination with Backbone.js.
* A.2.5 The addition of packages/libraries has to be agreed on by the *LGV* team. At least 3 libs need to be evaluated before decisions can be made. Use a form from **[library evalutaion](./library evaluation/)** and add to PR. 

---

#### A.3 Code

* A.3.1 New files are created in accordance with the existing structure.
* A.3.2 Names for variables, functions, folders, and files are in English and speaking.
* A.3.3 Comments are written in English.
* A.3.4 A function's block comment always describes its use.
* A.3.5 Styles are written in the `.scss` dialect.
* A.3.6 No use of `important!` in styles.
* A.3.7 Modules and components must only influence behavior and style of their own and child elements.
* A.3.8 No style changes may happen via JavaScript.
* A.3.9 All styles have a module dependant ID as prefix or are written in `scoped` mode.
* A.3.10 No inline styles exist.

---

#### A.4 Code documentation (via JSDoc)

* A.4.1 The documentation is written in English.
* A.4.2 The documentation build via `npm run buildJsDoc` does not throw an error.
* A.4.3 Backbone: For each function a JSDoc block comment with description, parameters, return value, and possibly events, is provided.
* A.4.4 Backbone: Class definitions are located above the `initialize()` with specification of all default values. All event listeners, event triggers, and event requests occurring are part of the class documentation.
* A.4.5 Backbone: If a class is inherited from, a *lend* comment exists.
* A.4.6 Backbone: Namespaces are defined in **[namespaces.js](../devtools/jsdoc/namespaces.js)**. They represent the folder structure and modules of the code.
* A.4.7 Backbone: Events are defined in **[events.js](../devtools/jsdoc/events.js)**.

---

#### A.5 Unit tests

* A.5.1 Unit tests exist for each testable function.
* A.5.2 For each module a test file exists with file extension `.test.js` (Backbone) or `.spec.js` (Vue). It lives in **[test/unittests/modules](../test/unittests/modules)** within a folder structure mirroring the code folder structure.
* A.5.3 For each function a positive test (call with plausible values) and a negative test (call with bad values, e.g. `undefined`, `[]`, `{}`, `""`, ...).

---

#### A.6 Backwards compatibility and configurability

* A.6.1 No hard-coded URLs or paths to external sources exist.
* A.6.2 Configurable parameters are documented in the `.md` files.
* A.6.3 All previously noted configuration parameters can still be used as described.
* A.6.4 Renamed or deleted parameters are marked `Deprecated`.

---

#### A.7 Languages

* A.7.1 Locales are extended in or added to all relevant files.
* A.7.2 Locale files are maintained in at least English and German.
* A.7.3 The fallback language is German.
* A.7.4 The documentation is maintained in English, with the only exception being the `config.json.md`, which is also maintained in German as `config.json.de.md`.

---

#### A.8 Changelog

* A.8.1 The changelog language is English.
* A.8.2 Deleting and adding features as well as fixing bugs is recorded in the changelog.
* A.8.3 Changes regarding UI, interfaces, or configuration are recorded in the changelog.
* A.8.4 Entries are assigned to one of the following categories: Added, Changed, Deprecated, Removed, Fixed.
* A.8.5 Entries are to be written in simple language. Avoid jargon. The changelog is read by users and developers alike.

---

#### A.9 File structure
A.9.1 The file structure of new modules is to be created according to the following scheme:

```bash
src
|--app-store
|   |-- utils
|   |-- actions.js
|   |-- getters.js
|   |-- index.js
|   |-- mutations.js
|   |-- state.js
|   |-- tests
|
|-- modules
|   |-- exampleModule
|   |   |-- components
|   |   |   |-- ExampleModule.vue
|   |   |   |-- ...
|   |   |-- store
|   |   |   |-- actionsExampleModule.js
|   |   |   |-- constantsExampleModule.js
|   |   |   |-- gettersExampleModule.js
|   |   |   |-- indexExampleModule.js
|   |   |   |-- mutationsExampleModule.js
|   |   |   |-- stateExampleModule.js
|   |   |
|   |   |-- tests
|   |   |   |-- unit
|   |   |   |   |-- components
|   |   |   |   |   |-- exampleModule.spec.js
|   |   |   |   |-- store
|   |   |   |   |   |-- actionsExampleModule.spec.js
|   |   |   |   |   |-- gettersExampleModule.spec.js
|   |   |   |   |   |-- mutationsExampleModule.spec.js
|   |   |   |-- end2end	(module-specific)
|   |   |   |   |-- ExampleModule.e2e.js
|   |
|   |-- controls
|   |   |-- ControlBar.vue
|   |   |-- ControlIcon.vue
|   |   |-- gettersControls.js
|   |   |-- indexControls.js
|   |   |-- mutationsControls.js
|   |   |-- ...
|   |   |-- exampleControl
|   |   |   |-- components
|   |   |   |-- store
|   |   |   |-- tests
|   |
|   |-- tools
|   |   |-- actionsTool.js
|   |   |-- indexTools.js
|   |   |-- Tool.vue
|   |   |-- exampleTool
|   |   |   |-- components
|   |   |   |-- store
|   |   |   |-- tests
|   |
|-- share-components
|   |-- exampleShareComponent.vue
|
|-- tests
|   |--end2end
|   |   |--exampleGlobalTest.e2e.js
|
|-- utils
|   |-- exampleGlobalFunction.js
|
|-- addons.js
|-- App.vue
|-- MainNav.vue
|-- MapRegion.vue
```

---

### Section B (optional)

The code is written as readable and understandable as possible. The goal is not to save lines, but the time of future developers working on the code.

#### B.1 Structure

* B.1.1 Markup (templates), styles (CSS), and logic (controller) are written with clean separation of concerns.
* B.1.2 The controller does not produce any HTML.
* B.1.3 The code holds no redundancies. ([No duplicated code / DRY](https://de.wikipedia.org/wiki/Don%E2%80%99t_repeat_yourself))
* B.1.4 Common functions with global applicability are store in a helper file.
* B.1.5 Each function has *one* well-defined task. ([Curly's Law](https://de.wikipedia.org/wiki/Single-Responsibility-Prinzip))
* B.1.6 Self-defined functions never change values by reference, but returns the calculated value.
* B.1.7 Templates contain no data-modifying logic or business logic.
* B.1.8 Vue: Persisting data and communicating is done via the VueX Store.

---

#### B.2 Readability and comprehensibility

* B.2.1 The code is written as simple as possible. ([KISS](https://de.wikipedia.org/wiki/KISS-Prinzip))
* B.2.2 Arrow functions are used whenever possible. The `this` context is not dragged along unnecessarily.
* B.2.3 Function parameters and properties have defined default values where applicable.
* B.2.4 Native ECMAScript functions and objects are used.
* B.2.5 Type checks are done with `typeof`, `instanceof`, `Array.isArray()`, and `===`.

---

#### B.3 Vue Best Practice

* B.3.1 Vue components in the `share-components` folder contain comments according to the [Vue Styleguidist](https://vue-styleguidist.github.io/).
* B.3.2 Backbone Radio - New Vue modules should avoid using the `Backbone.Radio` where possible. Radio events in old modules can be replaced with VueX store interaction.
* B.3.3 For requests it is recommended to use the library Axios.

---

#### B.4 Vue Best Practice - State management
* B.4.1 For simple getters and mutations the generator functions provided in `./src/app-store/utils/generator.js` are used.
* B.4.2 The VueX helper functions (`mapGetters`, `mapMutations`, ...) are used to integrate store data into components.

---

#### B.5 Vue Best Practice - Style

* B.5.1 Use `scoped` within the style tag whenever possible.
* B.5.2 Avoid usage of the `!important` keyword.
* B.5.3 Avoid setting `width` and `height` to absolute values, as this hinders designing responsively.
* B.5.4 The global scss file `variables.scss` contains all variables required by *BootstrapV3* and the Masterportal. All theming variables (fonts, colors, ...) are maintained here. The file `variables.scss` must only contain variables, mixins, and functions. Adding CSS rules would result in a repetition per import, bloating the CSS size. The `variables.scss` is imported to a component's style tag by using the `import` command.

---

#### B.6 Error message output

* B.6.1 Make use of the module *Alerting*.
* B.6.2 Write a speaking error that describes to the user what has gone wrong. Provide the message in multiple languages.
* B.6.3 Only display errors when relevant to the user and the user's current work step.
* B.6.4 When communicating an error to the user, include what went wrong, why it went wrong, and what can be done to resolve the situation. If the user has no option to rectify the situation, reconsider whether the error needs to be communicated at all.
* B.6.5 For technical details use `console.error()` or `console.warn()` and print information in English for your fellow developers.

---
