/* eslint-disable no-sync */
/* eslint-disable global-require */
const merge = require("webpack-merge"),
    // auskommentieren um eine grafische Darstellung vom bundle als html zu erzeugen
    // Visualizer = require("webpack-visualizer-plugin"),
    Common = require("./webpack.common.js"),
    fse = require("fs-extra"),
    HttpsProxyAgent = require("https-proxy-agent"),
    /* eslint-disable no-process-env */
    proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
    /* eslint-disable no-process-env */
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
    }
});

module.exports = function () {
    return merge.smart({
        mode: "development",
        devtool: "cheap-module-eval-source-map",
        devServer: {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            https: true,
            open: false,
            openPage: "portal/master",
            overlay: true,
            port: 9001,
            proxy: proxies,
            publicPath: "/build/"
        },
        module: {
            rules: [
                // Bootstrap Icons werden von bootstrap gelesen
                {
                    test: /bootstrap-icons\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../node_modules/bootstrap-icons/font/fonts"
                    }
                },
                // alle anderen Schriftarten
                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        publicPath: "../../css/fonts"
                    }
                }
            ]
        }
        // auskommentieren um eine grafische Darstellung vom bundle als html unter "build/statistics.html" zu erzeugen
        // plugins: [
        //     new Visualizer({
        //         filename: "./statistics.html"
        //     })
        // ]
    }, new Common());
};
