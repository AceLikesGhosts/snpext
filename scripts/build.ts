if(typeof Bun === 'undefined') {
    throw 'This project requires Bun (https://bun.sh) for building.';
}

declare module 'bun' {
    interface Env {
        DEV: string;
        WATCH: string;
        VERBOSE: string;
    }
}

import { name as pkgName, version as pkgVersion } from '../package.json';
import esbuild from 'esbuild';
import path from 'path';
import manifest from './manifest';
import plugins from './plugins';
import settings from './settings';
import pluginsMeta from './pluginsMeta';

const isWatch = Boolean(process.env.WATCH) ?? false;
const isDev = (Boolean(process.env.DEV) || isWatch) ?? false;
const isVerbose = Boolean(process.env.VERBOSE) ?? true;

export const injectedEntryPoint = path.join(__dirname, '..', 'src', 'entry.ts');
const contentScriptEntryPoint = path.join(__dirname, '..', 'src', '_settings', 'contentScript.ts');
const settingScriptEntryPoint = path.join(__dirname, '..', 'src', '_settings', 'settingScript.ts');
const backgroundScriptEntryPoint = path.join(__dirname, '..', 'src', '_settings', 'serviceWorker.ts');

export function getLastString(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1];
}

const banner = `
/**
 * ${ pkgName } (v${ pkgVersion }) @ ${ new Date() }
 * 
 * Defines:
 * IS_DEV: ${ isDev }
 * IS_VERBOSE: ${ isVerbose }
 * IS_WATCH: ${ isWatch }
 */
`.trim();

const options = {
    target: ['chrome89', 'firefox89', 'safari15', 'edge89'],
    globalName: pkgName,
    format: 'iife',
    define: {
        IS_DEV: `${ isDev }`,
        IS_VERBOSE: `${ isVerbose }`,
    },

    banner: {
        js: banner
    },

    bundle: true,
    minify: !isDev,
    sourcemap: true,
    logLevel: 'info',
    outdir: 'dist',

    plugins: [manifest, plugins]
} as esbuild.BuildOptions;

if(isDev) {
    const mainSplit = injectedEntryPoint.split(path.sep);
    const sourceMapUrl = mainSplit[injectedEntryPoint.length - 1] + '.map';

    options.footer = {
        js: `//# sourceMappingURL=${ sourceMapUrl }`
    };
}

async function build(entryPoints: string[], settingOverrides?: esbuild.BuildOptions) {
    if(isWatch) {
        const entryCtx = await esbuild.context({
            ...options,
            ...settingOverrides,
            entryPoints
        });

        await entryCtx.watch();
    } else {
        await esbuild.build({
            ...options,
            entryPoints
        });
    }
}

await build([injectedEntryPoint]);
await build([contentScriptEntryPoint], { globalName: void 0 });
await build([backgroundScriptEntryPoint], { globalName: void 0 });
await build([settingScriptEntryPoint], { globalName: void 0, plugins: [pluginsMeta, settings] });