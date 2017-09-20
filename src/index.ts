import wp = require("webpack");
import fs = require("fs");
import path = require("path");
import child_process = require("child_process");
import glob = require("glob");
import _ = require("lodash");

export interface PluginOption {
    sources?: string[];
    script: string;
}

export default class ScriptRunnerPlugin {
    protected startTime = Date.now();
    protected prevTimestamps: {[file: string]: number} = {};
    protected sources: string[] = [];

    public constructor(private option: PluginOption) {
    }

    public apply(compiler: wp.Compiler) {
        compiler.plugin("compilation", this.compilation.bind(this));
        compiler.plugin("after-emit", this.afterEmit.bind(this));
    }

    private compilation(compilation: wp.Compilation) {
        if (this.option.sources !== undefined) {
            const sources = _.map(_.flatten(_.map(
                this.option.sources, pattern => glob.sync(pattern)
            )), uri => path.resolve(uri));
            const changedFiles = _.keys(compilation.fileTimestamps).filter(
                watchfile => _.includes(sources, watchfile) && ((this.prevTimestamps[watchfile] || this.startTime) < (compilation.fileTimestamps[watchfile] || Infinity))
            );

            if (this.sources.length !== 0 && compilation.fileTimestamps.length !== 0 && changedFiles.length === 0) {
                return;
            }

            this.sources = sources;
        }
        try {
            child_process.execSync(this.option.script, {
                cwd: compilation.compiler.options.context
            });
        } catch (e) {
            compilation.errors.push(e.toString());
        }
    }

    private afterEmit(compilation: wp.Compilation, callback: (err?: Error) => void) {
        this.prevTimestamps = compilation.fileTimestamps;
        compilation.fileDependencies.push(...this.sources);
        callback();
    }
}