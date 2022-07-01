const webpack = require("webpack"),
    path = require("path"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    {VueLoaderPlugin} = require("vue-loader"),

    rootPath = path.resolve(__dirname, "../"),
    entryPoint = path.resolve(rootPath, "src_3_0_0/main.js");

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
    module: {
        rules: [
            // Javascript
            {
                test: /\.js$/,
                exclude: /\bnode_modules\b|\.(test|spec)\.js$/,
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
            i18next: path.resolve(path.join(__dirname, "../node_modules/i18next/dist/cjs/i18next.js"))
        })
    ]
};
