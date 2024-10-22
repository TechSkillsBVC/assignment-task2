module.exports = (api) => {
  api.cache(true);

  const presets = ['babel-preset-expo'];
  const plugins = ['react-native-reanimated/plugin'];

  return {
    presets,
    plugins,
  };
};
