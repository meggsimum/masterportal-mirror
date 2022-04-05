/* eslint-disable no-process-env */
const webpack = require("webpack"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    path = require("path"),
    fse = require("fs-extra"),
    VueLoaderPlugin = require("vue-loader/lib/plugin"),

    rootPath = path.resolve(__dirname, "../"),
    addonBasePath = path.resolve(rootPath, "addons"),
    addonConfigPath = path.resolve(addonBasePath, "addonsConf.json"),
    entryPoints = {masterportal: path.resolve(rootPath, "js/main.js")};

let addonEntryPoints = {};

if (!fse.existsSync(addonConfigPath)) {
    console.warn("NOTICE: " + addonConfigPath + " not found. Skipping all addons.");
}
else {
    addonEntryPoints = require(addonConfigPath);
}

module.exports = function () {
    const addonsRelPaths = {},
        vueAddonsRelPaths = {};

    for (const addonName in addonEntryPoints) {
        let isVueAddon = false,
            addonPath = addonName,
            entryPointFileName = "";

        if (typeof addonEntryPoints[addonName] === "string") {
            entryPointFileName = addonEntryPoints[addonName];
        }

        // An addon is recognized as Vue-Addon, if:
        // - its configuration value is an object
        // - with at least a key named "type"
        if (typeof addonEntryPoints[addonName] === "object" && addonEntryPoints[addonName].type !== undefined) {
            isVueAddon = true;

            if (typeof addonEntryPoints[addonName].entryPoint === "string") {
                entryPointFileName = addonEntryPoints[addonName].entryPoint;
            }
            else {
                entryPointFileName = "index.js";
            }

            if (typeof addonEntryPoints[addonName].path === "string") {
                addonPath = addonEntryPoints[addonName].path;
            }
        }

        const addonCombinedRelpath = [addonPath, entryPointFileName].join("/");

        // Now check if file exists
        if (!fse.existsSync(path.resolve(addonBasePath, addonCombinedRelpath))) {
            console.error("############\n------------");
            throw new Error("ERROR: FILE DOES NOT EXIST \"" + path.resolve(addonBasePath, addonCombinedRelpath) + "\"\nABORTED...");
        }

        if (isVueAddon) {
            vueAddonsRelPaths[addonName] = Object.assign({
                "entry": addonCombinedRelpath
            }, addonEntryPoints[addonName]);
        }
        else {
            addonsRelPaths[addonName] = addonCombinedRelpath;
        }

    }

    return {
        entry: entryPoints,
        stats: {
            all: false,
            colors: true,
            errors: true,
            errorDetails: true
            // assets: true
            // chunkModules: true
            // entrypoints: true
            // modules: true
            // outputPath: true
        },
        /*
        optimization: {
            splitChunks: {
                minSize: 0,
                maxInitialRequests: Infinity,
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: "all",
                        name: "vendor"
                        enforce: true
                    }
                }
            }
        },
        */
        output: {
            path: path.resolve(__dirname, "../build/"),
            filename: "js/[name].js",
            publicPath: "../../build/"
        },
        resolve: {
            alias: {
                text: "text-loader",
                "variables": path.resolve(__dirname, "..", "css", "variables.scss")
            }
        },
        module: {
            rules: [
                // ignore all files ending with ".test.js".
                {
                    test: /\.(test|spec)\.js$/,
                    use: {
                        loader: "null-loader"
                    }
                },
                // take all files ending with ".js" but not with ".test.js".
                {
                    test: /\.js$/,
                    exclude: /\bcore-js\b|\.(test|spec)\.js$/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {}
                        },
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        "css-loader"
                    ]
                },
                {
                    test: /\.vue$/,
                    loader: "vue-loader",
                    options: {
                        loaders: {
                            js: "babel-loader?presets[]=env"
                        }
                    }
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
                    test: /\.worker\.js$/,
                    use: {
                        loader: "worker-loader"
                    }
                }
            ]
        },
        plugins: [
            // provide libraries globally
            new webpack.ProvidePlugin({
                jQuery: "jquery",
                $: "jquery",
                Backbone: "backbone",
                Radio: "backbone.radio",
                i18next: ["i18next/dist/cjs/i18next.js"],
                _: "underscore"
            }),
            // create css under build/
            new MiniCssExtractPlugin({
                filename: "css/[name].css"
            }),
            new VueLoaderPlugin(),
            // import only de-locale from momentjs
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|de/),
            // create global constant at compile time
            new webpack.DefinePlugin({
                ADDONS: JSON.stringify(addonsRelPaths),
                VUE_ADDONS: JSON.stringify(vueAddonsRelPaths)
            })
        ]
    };
};
