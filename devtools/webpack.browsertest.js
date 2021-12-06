/* eslint-disable no-sync */
/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable no-process-env */
const merge = require("webpack-merge"),
    Common = require("./webpack.common.js"),
    Mocha = require("mocha"),
    mocha = new Mocha({fullTrace: true}),
    fse = require("fs-extra"),
    execute = require("child-process-promise").exec;

let proxies;

if (fse.existsSync("./devtools/proxyconf.json")) {
    proxies = require("./proxyconf.json");
}
else {
    proxies = require("./proxyconf_example.json");
}


module.exports = function (env, args) {
    const path2Addon = typeof args.ADDON === "string" && args.ADDON !== "" ? args.ADDON : "";

    return merge.smart({
        mode: "development",
        devtool: "eval-cheap-module-source-map",
        devServer: {
            port: 9001,
            publicPath: "/build/",
            overlay: true,
            open: true,
            https: true,
            openPage: "portal/master",
            proxy: proxies
        },
        module: {
            rules: [
                // Bootstrap Icons loaded by bootstrap
                {
                    test: /bootstrap-icons\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/bootstrap-icons/font/fonts"
                    }
                },
                // all other fonts
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                }
            ]
        },
        plugins: [
            {
                apply: (compiler) => {
                    compiler.hooks.done.tap("Compilation done", () => {
                        if (process.env.NODE_ENV === "e2eTest") {
                            mocha.addFile("./test/end2end/TestRunner.js");
                            // exit with non-zero status if there were test failures
                            mocha.run(failures => process.exitCode = failures ? 1 : 0)
                                .on("end", function () {
                                    execute("pkill -f node_modules/.bin/webpack-dev-server");
                                });
                        }
                    });
                }
            }
        ]
    }, new Common(path2Addon));
};
