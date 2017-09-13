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