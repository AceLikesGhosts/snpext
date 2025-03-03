import type { WebpackInstance, WebpackModuleMap, WebpackRequire } from '../types';
import type { AnyFunction } from '@/utils/patcher/PatcherTypes';
import { pluginPatches, waitForPatches } from '@/plugins/api/setupPlugins';
import { allowForSelf, escapeStringSub } from './regexWrappers';
import { moduleListeners } from './listeners';
import wait from '@/utils/wait';
import Logger from '@/utils/logger';
import pkg from '@/utils/pkg';

export const [waitForWebpack, resolveWebpack] = wait();

const CHUNK_NAME = 'webpackChunk_snapchat_web_calling_app' as const;
const logger = Logger.new('webpack', 'patcher');

logger.log('started');

let __ORIGINAL_PUSH__ = window[CHUNK_NAME]?.push;
export let wreq: WebpackRequire;
export let cache: WebpackModuleMap = {};

// credits: https://github.com/Vendicated/WebpackGrabber
// after about 2 minutes of work there *doesn't* seem
// to be a better way than this stupid object prototype
// fuckery. i hate webpack, i hate vendicated. i hate this!
function extractPrivateCache() {
    const sym = Symbol(`${ pkg.name }.extract`);

    Object.defineProperty(Object.prototype, sym, {
        get() {
            cache = this;
            return { exports: {} };
        },
        set() { },
        configurable: true,
    });

    wreq(sym);
    // @ts-expect-error this is ok, fuck off!
    delete Object.prototype[sym];

    wreq.c = cache;
}

Object.defineProperty(window, CHUNK_NAME, {
    configurable: true,
    get: () => __ORIGINAL_PUSH__,
    set(v) {
        __ORIGINAL_PUSH__ = v;

        if(v?.push && !v.push?.$original) {
            logger.log('patching #push');
            patchPush(v);

            // @ts-ignore
            delete window[CHUNK_NAME];
            window[CHUNK_NAME] = v;
        }
    },
});

function patchPush(webpackInstance: WebpackInstance) {
    async function handlePush(chunk: WebpackInstance) {
        logger.verbose(`patched #push called`);

        try {
            await patchFactories(chunk[1]);
        } catch(err) {
            logger.error(
                'handlePush failed, this is most likely the result of #patchFactories failing',
                (err as Error)?.message ?? err,
                (err as Error)?.stack ?? 'no stack',
            );

            if(IS_DEV) {
                throw err;
            }
        }

        // @ts-expect-error TODO: make this not a horrible type, can't be bothered!
        return handlePush.$original.call(webpackInstance, chunk);
    }

    handlePush.$original = webpackInstance.push;
    handlePush.toString = handlePush.$original.toString.bind(handlePush.$original);
    // @ts-expect-error this is ok, typescript is just throwing a fit because it's passing
    // multiple arguments, which it *should*. so FUCK off.
    handlePush.bind = (...args: unknown[]) => handlePush.$original.bind(...args);

    Object.defineProperty(window[CHUNK_NAME], 'push', {
        configurable: true,

        get: () => handlePush,
        set(v) {
            handlePush.$original = v;
        }
    });
}

// honestly, fuck you typescript, i cannot be bothered
// to attempt to type webpack's shitty fucking internals
// and whoever at webpack decided to not publish some form
// of dts needs to actually end their fucking life!
async function patchFactories(factories: any) {
    await waitForPatches;
    for(const id in factories) {
        let mod = factories[id];
        const originalMod = mod;

        let moduleSource: string = `export default ${ mod.toString() }`;
        const patchedBy = new Set<string>();
        const factory = factories[id] = function (module: any, exports: any, require: WebpackRequire) {
            if(!wreq || !cache) {
                wreq = require!;
                extractPrivateCache();
                resolveWebpack();
            }

            try {
                mod(module, exports, require);
            } catch(err) {
                if(mod === originalMod) throw err;

                // logger.error('error in patched module', err);
                logger.error(`error in patched module (id: ${ id })`);
                console.error('err', err);

                if(IS_DEV) {
                    throw err;
                }

                return void originalMod(module, exports, require);
            }

            exports = module.exports;
            if(!exports) {
                return;
            }

            try {
                for(const [filter, callback] of moduleListeners) {
                    if(exports && filter(exports, module, id)) {
                        moduleListeners.delete(filter);
                        callback(exports, module, id);
                    } else if(typeof exports === 'object') {
                        if(exports.default && filter(exports.default, module, id)) {
                            moduleListeners.delete(filter);
                            callback(exports.default, module, id);
                        } else {
                            for(const nested in exports) if(nested.length <= 3) {
                                if(exports[nested] && filter(exports[nested], module, id)) {
                                    moduleListeners.delete(filter);
                                    callback(exports[nested], module, id);
                                }
                            }
                        }
                    }
                }
            } catch(err) {
                logger.error('lazy module listener failed', err);
            }
        };

        // factory.toString = originalMod.toString.bind(originalMod);
        (<any>factory).$original = originalMod;

        for(const pluginPatch of pluginPatches) {
            for(const patch of pluginPatch.patches) {
                const moduleMatcher = typeof patch.find === 'string'
                    ? moduleSource.includes(patch.find)
                    : patch.find.test(moduleSource);

                if(!moduleMatcher) {
                    continue;
                }

                patchedBy.add(pluginPatch.owner);

                const patchSource = (matcher: RegExp | string, replace: string, source: string) => {
                    if(typeof matcher === 'string') {
                        return source.replace(matcher, replace);
                    } else if(matcher instanceof RegExp) {
                        const match = source.match(matcher);
                        if(match) {
                            for(let i = 0; i < match.length; i++) {
                                logger.verbose(i, match[i]);
                            }

                            // replace $0 with the entire matched string
                            const newReplace = replace.replace(/\$0/g, match[0]);
                            return source.replace(matcher, newReplace);
                        }
                    }

                    return source;
                };

                for(const replacement of patch.replacements) {
                    try {
                        let newSource: string;

                        logger.verbose('patches owned by ', pluginPatch.owner);
                        logger.verbose('find/replacement', patch.find, replacement);
                        if(typeof replacement.replace === 'function') {
                            newSource = moduleSource.replace(replacement.find, replacement.replace);
                        } else {
                            newSource = patchSource(
                                replacement.find,
                                allowForSelf(pluginPatch.owner, replacement.replace),
                                moduleSource,
                            );
                        }

                        if(newSource === moduleSource) {
                            continue;
                        }

                        moduleSource = newSource;

                        // hack to get around the lack of eval in manifest v3
                        // this is essentially the same, good job Google!
                        const blob = new Blob([
                            `// mod ${ id } - patched by ${ [...patchedBy].join(', ') }\n${ newSource }`
                        ], { type: 'application/javascript' });
                        const url = URL.createObjectURL(blob);

                        const newMod: { default?: AnyFunction; } = await import(url)
                            .finally(() => {
                                URL.revokeObjectURL(url);
                            });

                        mod = newMod?.default ?? (() => void 0);
                        logger.verbose(
                            `${ pluginPatch.owner } patched`,
                            id,
                            newMod,
                        );
                    } catch(err) {
                        logger.error(
                            `webpack patch by ${ pluginPatch.owner } failed on mod id ${ id }`,
                            ((err as { message?: string; })?.message ?? err)
                        );

                        patchedBy.delete(pluginPatch.owner);

                        // if we are in dev mode rethrow the error.
                        // this proceeds to get catched in #handlePush
                        if(IS_DEV) {
                            throw err;
                        }
                    }
                }
            }
        }
    }
}