const nextEnv = require('next-env');
const dotenvLoad = require('dotenv-load');
const {InjectManifest} = require('workbox-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
dotenvLoad();
 
const withNextEnv = nextEnv();
 
module.exports = withNextEnv({
  distDir: 'app',
  strictMode: false,
  
  webpack: (config) => {
    const oldEntriesPromise = config.entry();

    config.entry = async () => {
      const oldEntries = await oldEntriesPromise;
      return {
        ...oldEntries,
        "firebase-messaging-sw": {
          import: './imports/firebase-messaging-sw.ts',
          filename: '../public/firebase-messaging-sw.js',
        }
      }
    };
    
    config.resolve.fallback = {
      "buffer": require.resolve('buffer/'),
      "events": require.resolve("events/"),
      "os": false,
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
    };

    return config;
  },
});