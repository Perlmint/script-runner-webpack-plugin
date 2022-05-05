import wp = require('webpack');
import path = require('path');
import child_process = require('child_process');
import glob = require('glob');

export interface PluginOption {
    sources?: string[];
    description?: string;
    script: string;
}

type ExtractHook<T> = T extends import('tapable').AsyncSeriesHook<infer A, infer B> ? A : never;

export default class ScriptRunnerPlugin {
    protected static scriptName = 'ScriptRunnerPlugin';
    protected lastTimeStamp = 0;
    protected sources: string[] = [];

    public constructor(private option: PluginOption) {
    }

    public apply(compiler: wp.Compiler) {
        compiler.hooks.beforeCompile.tapPromise(ScriptRunnerPlugin.scriptName, this.beforeCompile.bind(this, compiler));
        compiler.hooks.thisCompilation.tap(ScriptRunnerPlugin.scriptName, this.thisCompilation.bind(this));
        compiler.hooks.afterDone.tap(ScriptRunnerPlugin.scriptName, this.afterDone.bind(this));
    }

    private async beforeCompile(compiler: wp.Compiler): Promise<void> {
        if (this.option.sources !== undefined) {
            const sources = this.option.sources.map(pattern => glob.sync(pattern)).flat().map(uri => path.resolve(uri));

            if (compiler.fileTimestamps != null) {
                const fileChanged = sources.some((source) => {
                    const ts = compiler.fileTimestamps.get(source);
                    return this.lastTimeStamp < ((ts != null && ts != 'ignore') ? ts.safeTime : Infinity);
                });

                if (this.sources.length !== 0 && !fileChanged) {
                    return;
                }
            }

            this.sources = sources;
        }
        const logger = compiler.getInfrastructureLogger(ScriptRunnerPlugin.scriptName);
        logger.info(`run script${this.option.description ? ` - ${this.option.description}` : ''}`);
        try {
            child_process.execSync(this.option.script, {
                cwd: compiler.options.context
            });
        } catch (e) {
            logger.error(e);
        }
    }

    private thisCompilation(compilation: wp.Compilation) {
        compilation.fileDependencies.addAll(this.sources);
    }

    private afterDone(stats: wp.Stats) {
        this.lastTimeStamp = stats.compilation.startTime;
    }
}