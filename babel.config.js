module.exports = function (api) {
  api.cache(true);
  const presets = ['babel-preset-expo'];

  const plugins = [];
  // En production, retirer tous les console.* pour alléger le bundle
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  return {
    presets,
    plugins,
  };
};
