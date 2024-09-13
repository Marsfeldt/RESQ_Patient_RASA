const path = require('path');
const {getDefaultConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      'react-native': path.resolve(__dirname, '../node_modules/react-native'), // Adjusted to resolve correctly
    },
  },
  watchFolders: [
    path.resolve(__dirname, '../node_modules'), // Ensure the correct node_modules folder is watched
    path.resolve(__dirname, '../src'),
    path.resolve(__dirname, '../'),
  ],
};
