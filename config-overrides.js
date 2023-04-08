module.exports = function override(config) {
    config.module.rules[1].oneOf.splice(2, 0, {
        test: /\.less$/i,
        exclude: /\.module\.(less)$/,
        use: [
            { loader: "style-loader" },
            { loader: "css-loader" },
            {
                loader: "less-loader",
                options: {
                    lessOptions: {
                        javascriptEnabled: true,
                    },
                },
            },
        ],
    })
    return config
}