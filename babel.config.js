module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { unstable_transformImportMeta: true, compiler: false }]
    ],
    plugins: [
      "react-native-reanimated/plugin", // Must be listed last
    ],
  };
};
