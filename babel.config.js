module.exports = function (api) {
    api.cache(false);
    const presets = [
            [
                "@babel/preset-env", {
                    "useBuiltIns": "entry",
                    "corejs": {
                        "version": 3
                    },
                    "targets": {
                        "browsers": ["defaults"]
                    }
                }
            ]
        ],
        plugins = [
            "@babel/plugin-syntax-dynamic-import",
            "@babel/plugin-proposal-object-rest-spread"
        ];

    return {
        presets,
        plugins
    };
};
