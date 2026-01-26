// craco.config.js
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
  enableVisualEdits: isDevServer, // Only enable during dev server
};

// Conditionally load visual edits modules only in dev mode
let setupDevServer;
let babelMetadataPlugin;

if (config.enableVisualEdits) {
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {

      // Add ignored patterns to reduce watched directories
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };

      // Fix for Vercel/Supabase environment variables
      // Injects both REACT_APP_ prefixed and non-prefixed versions
      // This ensures compatibility with both CRA defaults and Vercel environment variables
      const webpack = require('webpack');
      
      // Helper to safely get env var value
      const getEnvValue = (...keys) => {
        for (const key of keys) {
          const value = process.env[key];
          if (value && value.trim() !== '') {
            return value;
          }
        }
        return undefined;
      };
      
      const supabaseUrl = getEnvValue('REACT_APP_SUPABASE_URL', 'SUPABASE_URL');
      const supabaseKey = getEnvValue('REACT_APP_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_KEY');
      
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          // REACT_APP_ prefixed versions (for CRA)
          'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(supabaseUrl),
          'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
          // Non-prefixed versions (for backward compatibility)
          'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
          'process.env.SUPABASE_KEY': JSON.stringify(supabaseKey),
        })
      );

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

// Only add babel metadata plugin during dev server
if (config.enableVisualEdits && babelMetadataPlugin) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

webpackConfig.devServer = (devServerConfig) => {
  // Apply visual edits dev server setup only if enabled
  if (config.enableVisualEdits && setupDevServer) {
    devServerConfig = setupDevServer(devServerConfig);
  }

  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

module.exports = webpackConfig;
