const {merge} = require("webpack-merge"),
    path = require("path"),
    common = require("./webpack.common.js"),

    rootPath = path.resolve(__dirname, "../"),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))();

module.exports = merge(common, {
    mode: "production",
    output: {
        path: path.resolve(rootPath, "./dist/build"),
        filename: "js/[name].js",
        publicPath: "../mastercode/" + mastercodeVersionFolderName + "/",
        clean: true
    },
    module: {
        rules: [
            // Fonts and SVGs
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: "asset/resource",
                generator: {
                    filename: "css/woffs/[name][ext][query]"
                }
            }
        ]
    }
});
