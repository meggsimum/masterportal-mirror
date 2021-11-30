/**
 * See https://www.digitalocean.com/community/tutorials/vuejs-demistifying-vue-webpack
 */
const webpack = require("webpack"),
    Vue = require("vue"),
    VueLoaderPlugin = require("vue-loader/lib/plugin");

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
    devtool: "cheap-module-eval-source-map",
    output: {
        devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    },
    resolve: {
        alias: {
            vue: "vue/dist/vue.js"
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/\bcore-js\b/, /node_modules/],
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {},
                    optimizeSSR: false
                }
            },
            {
                test: /\.(le|c|sa)ss$/,
                use: "null-loader"
            },
            {
                test: /\.worker\.js$/,
                use: {loader: "worker-loader"}
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader"
                    }
                ]
            }
        ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore",
            i18next: ["i18next/dist/cjs/i18next.js"]
            // Config: path.resolve(__dirname, "../test/unittests/deps/testConfig"),
            // XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            // fs: "fs",
            // requestAnimationFrame: "raf"
        }),
        new VueLoaderPlugin()
    ],
    node: {
        fs: "empty"
    }
};
