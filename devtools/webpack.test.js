/**
 * See https://www.digitalocean.com/community/tutorials/vuejs-demistifying-vue-webpack
 */
const {webpack} = require("webpack"),
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
    target: false,
    // use when debugging:
    // devtool: "cheap-module-eval-source-map",
    // output: {
    //     devtoolModuleFilenameTemplate: "[absolute-resource-path]"
    // },

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
            {
                test: /\.js$/,
                exclude: /\bcore-js\b|\bvideo.js\b|\bsinon\b|\bturf\b|\bjsts\b/,
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
                test: /\.(le|c|sa|sc)ss$/,
                use: "null-loader"
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
            },
            {
                test: /\.xml$/i,
                type: "asset/resource"
            },
            {
                test: /\.worker\.js$/,
                use: {
                    loader: "worker-loader"
                }
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: "asset/resource"
            }
        ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.ProvidePlugin({
            i18next: ["i18next/dist/cjs/i18next.js"],
            mapCollection: [path.resolve(path.join(__dirname, "../src/core/maps/mapCollection.js")), "default"],
            Config: path.resolve(__dirname, "../test/unittests/deps/testConfig")
            // XMLSerializer: path.resolve(__dirname, "../test/unittests/deps/testXmlSerializer"),
            // fs: "fs",
            // requestAnimationFrame: "raf"
        }),
        new VueLoaderPlugin(),
        new webpack.IgnorePlugin({resourceRegExp: [/canvas/, /jsdom$/]})
    ]
};
