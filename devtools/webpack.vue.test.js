/**
 * See https://www.digitalocean.com/community/tutorials/vuejs-demistifying-vue-webpack
 */
const webpack = require("webpack"),
    path = require("path"),
    Vue = require("vue"),
    {VueLoaderPlugin} = require("vue-loader");

require("regenerator-runtime/runtime");
require("jsdom-global")();
require("proj4");

global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;

URL.createObjectURL = function () {
    return false;
};
Vue.config.devtools = false;

module.exports = {
    mode: "development",
    target: "node",
    resolve: {
        alias: {
            vue: "vue/dist/vue.js"
        },
        fallback: {
            fs: "empty"
        }
    },
    module: {
        rules: [
            // Javascript
            {
                test: /\.js$/,
                exclude: /\bnode_modules\b|\bprecompiled-mqtt\b/,
                use: {
                    loader: "babel-loader"
                }
            },
            // Vue
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            // Images
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: "asset/resource"
            },
            {
                test: /\.(le|c|sa|sc)ss$/,
                use: "null-loader"
            },
            {
                test: /\canvas$/,
                use: "null-loader"
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|gif)$/,
                exclude: /fonts/, /* dont want svg fonts from fonts folder to be included */
                type: "asset/resource"
            },
            {
                test: /\.xml$/i,
                type: "asset/resource"
            }
        ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.ProvidePlugin({
            i18next: path.resolve(path.join(__dirname, "../node_modules/i18next/dist/cjs/i18next.js")),
            mapCollection: [path.resolve(path.join(__dirname, "../src/core/maps/mapCollection.js")), "default"],
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore",
            fs: "fs",
            requestAnimationFrame: "raf"
        }),
        new VueLoaderPlugin()
    ]
};

