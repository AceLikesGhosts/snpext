if(typeof Bun === 'undefined') {
    throw 'This project requires Bun (https://bun.sh) for building.';
}

import { name as pkgName, version as pkgVersion } from '../package.json';
import esbuild from 'esbuild';
import path from 'path';
import manifest from './plugins/manifest';
import plugins from './plugins/plugins';
import { args } from './args';

const {
    values: {
        verbose: isVerbose,
        watch: isWatch,
        dev: isDev,
        lfor
    }
} = args;

// let loggingEnabledFor: string | undefined = lfor;
// if(isDev && loggingEnabledFor === undefined) {
//     loggingEnabledFor = '[*]';
// } else if(loggingEnabledFor !== undefined) {
//     loggingEnabledFor = `[${ loggingEnabledFor?.split(/\s|,|,\s/) }]`;
// }

const loggingEnabledFor = lfor?.split(/\s|,/);

export const injectedEntryPoint = path.join(__dirname, '..', 'src', 'entry.ts');

const banner = `
/**
 * ${ pkgName } (v${ pkgVersion }) @ ${ new Date() }
 * 
 * Defines:
 * IS_DEV: ${ isDev }
 * IS_VERBOSE: ${ isVerbose }
 * IS_WATCH: ${ isWatch }
 * LFOR: ${ loggingEnabledFor }
 */
`.trim();

const LFOR: Record<string, boolean> = {};
for(const item of loggingEnabledFor || []) {
    LFOR[item] = true;
}

const options = {
    target: ['chrome89', 'firefox89', 'safari15', 'edge89'],
    globalName: pkgName,
    format: 'iife',
    define: {
        IS_DEV: `${ isDev }`,
        LFOR: JSON.stringify(LFOR)
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