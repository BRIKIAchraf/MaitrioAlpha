const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.transformer = config.transformer || {};

if (!config.resolver.extraNodeModules) {
  config.resolver.extraNodeModules = {};
}

module.exports = config;
