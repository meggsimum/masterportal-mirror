/* eslint-disable no-process-env */
const {merge} = require("webpack-merge"),
    path = require("path"),
    fse = require("fs-extra"),
    HttpsProxyAgent = require("https-proxy-agent"),
    common = require("./webpack.common.js"),

    rootPath = path.resolve(__dirname, "../"),
    proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    proxyAgent = proxyServer !== undefined ? new HttpsProxyAgent(proxyServer) : "";

let proxies;

if (fse.existsSync("./devtools/proxyconf.json")) {
    proxies = require("./proxyconf.json");
}
else {
    proxies = require("./proxyconf_example.json");
}

Object.keys(proxies).forEach(proxy => {
    if (proxies[proxy].agent !== undefined) {
        proxies[proxy].agent = proxyAgent;
        proxies[proxy].logLevel = "error";
    }
});

module.exports = merge(common, {
    mode: "development",
    cache: false,
    devtool: "eval-cheap-module-source-map",
    devServer: {
        client: {
            overlay: true
        },
        compress: true,
        devMiddleware: {
            publicPath: "/build/"
        },
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        hot: true,
        open: false,
        port: 9001,
        proxy: proxies,
        server: "https",
        static: {
            directory: rootPath
        }
    },
    output: {
        path: path.resolve(__dirname, "../build/"),
        filename: "js/[name].js",
        publicPath: "../../build/"
    },
    module: {
        rules: [
            // Fonts and SVGs
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: "asset/resource"
            }
        ]
    }
});
