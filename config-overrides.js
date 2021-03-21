module.exports = function override(config, env) {
    config.module.rules.unshift({ // Must put this config at beginning of rules.
		test: /\.worker\.ts$/,
		use: { loader: 'worker-loader' }
	});
    return config;
}