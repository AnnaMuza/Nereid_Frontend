module.exports = {
    chainWebpack: (config) => {
        config
            .plugin('html')
            .tap((args) => {
                const [htmlWebpackPluginConfig] = args;
                htmlWebpackPluginConfig.title = 'Nereid'
                return args;
            })
    }
}

