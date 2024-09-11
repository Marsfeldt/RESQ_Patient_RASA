/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @format
 */
module.exports = {
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  // No manual resolution of '@babel/runtime'
};
