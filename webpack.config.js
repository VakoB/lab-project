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
        generated: path.resolve(__dirname, 'generated'),
      },
      plugins: [],
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          const lazyImports = [
            '@apollo/subgraph',
            '@apollo/gateway',
            '@as-integrations/express5',
            '@as-integrations/fastify',
            'ts-morph',
          ];
          if (!lazyImports.includes(resource)) {
            return false;
          }
          try {
            require.resolve(resource, { paths: [process.cwd()] });
            return false;
          } catch (err) {
            return true;
          }
        },
      }),
    ],
  };
};
