# Unit tests in Vue

For an example test suite, see *masterportal/src/modules/tools/scaleSwitcher/tests*. Tests can be started in the Masterportal's root folder by either calling `npm run test:vue` (one-time run) or `npm run test:vue:watch` (updates on file changes).

## How to write tests

### Test file location

Test files are to be saved with the file extension `.spec.js`. All test files are to be placed next to the component and store being tested in a separate `tests/unit` folder. For illustration, the following example was constructed using the `ScaleSwitcher` component.

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

## File structure

The following sub-chapters contain example test files that may be used as guideline.

### Component test

```js
// modules/tools/scaleSwitcher/components/ScaleSwitcher.vue
import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import ScaleSwitcherComponent from "../../../components/ScaleSwitcher.vue";
import ScaleSwitcher from "../../../store/indexScaleSwitcher";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/scaleSwitcher/components/ScaleSwitcher.vue", () => {
    const scales = ["1000", "5000", "10000"],
        mockMapGetters = {
            scales: () => scales,
            scale: sinon.stub(),
            getView: sinon.stub()
        },
        mockMapActions = {
            setResolutionByIndex: sinon.stub()
        },
        mockMapMutations = {
            setScale: sinon.stub()
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            scaleSwitcher:
                            {
                                "name": "translate#common:menu.tools.scaleSwitcher",
                                "icon": "bi-arrows-angle-contract",
                                "renderToWindow": true
                            }
                        }
                    }
                }
            }
        };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        ScaleSwitcher
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.dispatch("Tools/ScaleSwitcher/setActive", true);
    });

    it("renders the scaleSwitcher", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.true;
    });

    it("do not render the scaleSwitchers select if not active", () => {
        store.dispatch("Tools/ScaleSwitcher/setActive", false);
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue});

        expect(wrapper.find("#scale-switcher").exists()).to.be.false;
    });

    it("has initially set all scales to select", () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        expect(options.length).to.equal(scales.length);
        scales.forEach((scale, index) => {
            expect(scale).to.equal(options.at(index).attributes().value);
        });
    });

    it("select another scale changes scale in map", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            options = wrapper.findAll("option");

        options.at(1).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(1).attributes().selected).to.equals("true");
        expect(options.at(0).attributes().selected).to.be.undefined;
        expect(options.at(2).attributes().selected).to.be.undefined;
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledOnce).to.equal(true);

        options.at(2).trigger("change");
        await wrapper.vm.$nextTick();
        expect(options.at(2).attributes().selected).to.equals("true");
        // maps scale change should be called
        expect(mockMapActions.setResolutionByIndex.calledTwice).to.equal(true);
    });

    it("method selectionChanged shall change currentScale", async () => {
        const wrapper = shallowMount(ScaleSwitcherComponent, {store, localVue}),
            event = {
                target: {
                    value: scales[1],
                    selectedIndex: 1
                }
            };

        wrapper.vm.selectionChanged(event);
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.ScaleSwitcher.currentScale).to.equals(scales[1]);
    });
});
```

### Store/getters test

```js
// modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js
import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";

const {currentScale} = getters;

describe("src/modules/tools/scaleSwitcher/store/gettersScaleSwitcher.js", () => {
    describe("getCurrentScale", () => {
        it("returns the scale from state", () => {
            const state = {
                currentScale: "1000"
            };

            expect(currentScale(state)).to.equals("1000");
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(name(stateScaleSwitcher)).to.be.equals("common:menu.tools.scaleSwitcher");
        });
        // (...) - test further default values
    });
});
```

### Store/actions test

Note the use of the `testAction` function imported from `test/unittests/VueTestUtils`. This tool shortens the code required and provides a sound action test base.

```js
// modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsScaleSwitcher";

const {setActive} = actions;

describe("src/modules/tools/scaleSwitcher/store/actionsScaleSwitcher.js", () => {
    describe("setActive", () => {
        const rootState = {
            Map: {
                scale: "60033.65329850641"
            }
        };

        it("setActive(true) should set rounded currentScale", done => {
            const payload = true,
                mutationActivePayload = true,
                mutationScalePayload = 60000;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload},
                {type: "setCurrentScale", payload: mutationScalePayload}
            ], {}, done);

        });
        it("setActive(false) should not set currentScale", done => {
            const payload = false,
                mutationActivePayload = false;

            testAction(setActive, payload, {}, rootState, [
                {type: "setActive", payload: mutationActivePayload}
            ], {}, done);

        });
    });
});
```

### Store/mutations test

```js
// modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js
import {expect} from "chai";
import mutations from "../../../store/mutationsScaleSwitcher";

const {setCurrentScale} = mutations;

describe("src/modules/tools/scaleSwitcher/store/mutationsScaleSwitcher.js", () => {
    describe("setCurrentScale", () => {
        it("sets the scale to state", () => {
            const state = {
                currentScale: null
            },
            payload = "1000";

            setCurrentScale(state, payload)
            expect(state.currentScale).to.equals("1000");
        });
    });
});
```

## About the libraries

### Mocha

`describe` is used to declare a section. In the example, the outer `describe` is used to describe the module being tested. Nested `describe`s are used to name the function currently under test.

You may use `describe.only` to run only a specific test section, or `describe.skip` to temporarily comment out tests during development.

```js
describe(name, callback)
```

With `it`, the single test cases are encapsulated. For the first parameter, provide a descriptive text that outlines a property the method under test should have.

For the second parameter, provide a callback function that checks whether this described property actually holds. Use `expect` (see below) for checks.

The suffixes `.skip` and `.only` work the same way as described for `describe`.

```js
it(testCaseDescription, callback)
```

The function `before` is used for test preparations for multiple `it` cases and is executed *once* within the surrounding `describe`.

The function `beforeEach` is used for test preparations per `it` case and is therefore executed `once` per `it` in the surrounding `describe`.

The functions `after` and `afterEach` work comparably after test execution.

For more documentation regarding Mocha, please read the [Mocha documentation pages](https://mochajs.org/).

### Chai

Each `it` case should contain a call to the `expect` function.

`expect` can be used to check one or multiple properties of an object.

```js
expect(model.testMe()).to.be.true;

expect(model.testMe()).to.deep.equal({name: "Jon Snow"});
```

For more documentation regarding Chai, please read the [Chai API reference](https://chaijs.com/api/bdd/).

## Best practices

A test should fail for a *single reason*. That is, per `it` only a single `expect` should be used, if possible.

Test cases should be *simple*. Two small quick tests are preferred to one complex construct covering multiple cases.

When testing, ponder which *edge cases* should be considered. That is, test with unusual values, e.g. extremely high or low values, or seemingly nonsensical inputs like `undefined` or the empty string.

Test positively and negatively. That is, do not only ensure that the expected result is returned, but also validate no undesired side effects are produced.

## Further reading

* [Vue test utils](https://vue-test-utils.vuejs.org/)
* [Vue testing handbook](https://lmiller1990.github.io/vue-testing-handbook/)
* [Vue.js testing guide](https://vuejs.org/v2/guide/unit-testing.html#ad)
* [VueX testing](https://vuex.vuejs.org/guide/testing.html)
