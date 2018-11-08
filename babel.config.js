/* eslint-env node */

/*
 * babel needed for jesting: Node does not support import/export
 * .babelrc does not work here since it does not affect node_modules/ol (babel.config.js does)
 */
module.exports = {
    "env": {
        "test": {
            "plugins": ["@babel/plugin-transform-modules-commonjs"]
        }
    }
};
