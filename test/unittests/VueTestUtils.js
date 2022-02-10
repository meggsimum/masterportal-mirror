import "regenerator-runtime/runtime";
import {expect} from "chai";
/**
 * Helper for testing action with expected mutations.
 * Mocks the commit and calls the action and checks the expexted mutations.
 * @param {Function} action will be called the action with mocked store and arguments
 * @param {Object} payload the action is called with
 * @param {Object} state the action is called with
 * @param {Object} rootState app's root state
 * @param {Object[]} expectedMutationsAndActions mutations expected to call and actions expected to dispatch
 * @param {Object} [getters={}] mocks for the expected getters to be called
 * @param {Function} [done=null] will be called if finished or fails
 * @param {Object} [rootGetters={}] app's root getters
 * @returns {void}
 */
export default function testAction (action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done = null, rootGetters = {}) {
    let commit = null,
        dispatch = null,
        count = 0;

    // mock dispatch
    /* eslint-disable no-shadow */
    dispatch = (type, payload) => {
        const action = expectedMutationsAndActions[count];

        if (action.dispatch === true) {
            try {
                expect(type).to.equal(action.type);
                expect(payload).to.deep.equal(action.payload);
            }
            catch (error) {
                done(error);
            }

            count++;
            if (count >= expectedMutationsAndActions.length) {
                done();
            }
        }
    };

    // mock commit
    /* eslint-disable no-shadow */
    commit = (type, payload) => {
        const mutation = expectedMutationsAndActions[count];

        try {
            expect(type).to.equal(mutation.type);
            expect(payload).to.deep.equal(mutation.payload);
        }
        catch (error) {
            done(error);
        }

        count++;
        if (count >= expectedMutationsAndActions.length) {
            done();
        }
    };

    // call the action with mocked store and arguments
    action({commit, dispatch, state, rootState, getters, rootGetters}, payload);

    // check if no mutations should have been dispatched
    if (expectedMutationsAndActions.length === 0) {
        expect(count).to.equal(0);
        done();
    }
}
