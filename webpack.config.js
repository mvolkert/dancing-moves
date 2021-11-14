var webpack = require('webpack');

module.exports = {
    resolve: {
        alias: { 
            stream: "stream-browserify",
            crypto: "crypto-browserify"
        }
    }
}