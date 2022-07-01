const webpack = require("webpack"),
    path = require("path"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    {VueLoaderPlugin} = require("vue-loader"),

    rootPath = path.resolve(__dirname, "../"),
    // addonBasePath = path.resolve(rootPath, "addons"),
    // addonConfigPath = path.resolve(addonBasePath, "addonsConf.json"),
    entryPoint = path.resolve(rootPath, "js/main.js");

// let addonEntryPoints = {};

// if (!fse.existsSync(addonConfigPath)) {
//     console.warn("NOTICE: " + addonConfigPath + " not found. Skipping all addons.");
// }
// else {
//     addonEntryPoints = require(addonConfigPath);
// }

module.exports = {
    entry: {
        masterportal: entryPoint
    },
    optimization: {
        usedExports: true
    },
    performance: {
        hints: false
    },
    stats: {
        preset: "minimal",
        moduleTrace: true,
        colors: true,
        errors: true,
        errorDetails: true
    },
    resolve: {
        alias: {
            variables: path.resolve(__dirname, "../css/variables.scss")
        },
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "timers": require.resolve("timers-browserify"),
            "url": require.resolve("url/")
        }
    },
    module: {
        rules: [
            // Javascript
            {
                test: /\.js$/,
                exclude: /\bcore-js\b|\bmqtt\b|\.(test|spec)\.js$/,
                use: {
                    loader: "babel-loader"
                }
            },
            // Images
            {
                test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                type: "asset/resource"
            },
            // CSS and Sass
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader"
                ]
            },
            // Vue
            {
                test: /\.vue$/,
                loader: "vue-loader"
            }
        ]
    },
    plugins: [
        // create css under build/
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
        new VueLoaderPlugin(),
        // import only de-locale from momentjs
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
        // provide libraries globally
        new webpack.ProvidePlugin({
            i18next: path.resolve(path.join(__dirname, "../node_modules/i18next/dist/cjs/i18next.js")),
            jQuery: "jquery",
            $: "jquery",
            Backbone: "backbone",
            Radio: "backbone.radio",
            _: "underscore",
            Buffer: ["buffer", "Buffer"]
        })
        // create global constant at compile time
        // new webpack.DefinePlugin({
        //     ADDONS: JSON.stringify(addonsRelPaths),
        //     VUE_ADDONS: JSON.stringify(vueAddonsRelPaths)
        // })
    ]
};
