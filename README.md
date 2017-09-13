[![npm version](https://badge.fury.io/js/script-runner-webpack-plugin.svg)](https://badge.fury.io/js/script-runner-webpack-plugin)
[![dependencies Status](https://david-dm.org/perlmint/script-runner-webpack-plugin/status.svg)](https://david-dm.org/perlmint/script-runner-webpack-plugin)
[![devDependencies Status](https://david-dm.org/perlmint/script-runner-webpack-plugin/dev-status.svg)](https://david-dm.org/perlmint/script-runner-webpack-plugin?type=dev)

# script-runner-webpack-plugin
Simple script runner plugin for webpack - support watching source files

## Usage
```javascript
const ScriptRunnerPlugin = require('script-runner-webpack-plugin').default;

module.exports = {
    plugins: [
        new ScriptRunnerPlugin({
            sources: [path.join(__dirname, "..", "schema", "*.json")],
            script: "npm run build:schema"
        })
    ]
}
```

## Option

### `sources`?: string[]

sources glob patterns.

webpack will watching matched files.

### `script`: string

script to run.