/**
 * See https://www.digitalocean.com/community/tutorials/vuejs-demistifying-vue-webpack
 */
const webpack = require("webpack"),
    path = require("path"),
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
    // use when debugging:
    // devtool: "cheap-module-eval-source-map",
    // output: {
    //     devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    // },
    devtool: "inline-cheap-module-source-map",
    output: {
        // use absolute paths in sourcemaps (important for debugging via IDE)
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        devtoolFallbackModuleFilenameTemplate: "[absolute-resource-path]?[hash]"
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
            },
            {
                test: /\.(svg)$/,
                exclude: /fonts/, /* dont want svg fonts from fonts folder to be included */
                use: [
                    {
                        loader: "svg-url-loader",
                        options: {
                            noquotes: true
                        }
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
            i18next: ["i18next/dist/cjs/i18next.js"],
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig")
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
