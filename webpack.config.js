const path = require('path');

module.exports = (options, webpack) => {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      extensions: ['.ts', '.js'],
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
      alias: {
        '@app/shared': path.resolve(__dirname, 'libs/shared/src'),
      },
    },
  };
};
