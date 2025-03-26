// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// Make sure the app directory is included in watchFolders
config.watchFolders = [...(config.watchFolders || []), "./app"];

module.exports = config;
