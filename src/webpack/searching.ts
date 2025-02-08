import type { WebpackSearchOptions, WebpackModule, LazyCallback, WebpackFilter } from './types';
import { moduleListeners } from './patching/listeners';
import { Filters } from './Filters';
import { cache } from './patching';
import Logger from '@/utils/logger';
import wait from '@/utils/wait';

const logger = Logger.new('webpack', 'searcher');

export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }): T;
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }): T[];
export function getById(id: string | number, options?: WebpackSearchOptions & { raw: true; withKey: false; all?: false; }): WebpackModule;
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw: true; all: true; withKey?: false; }): WebpackModule[];
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }): [string, T];
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw?: false; all: true; withKey: true; }): [string, T][];
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw: true; all?: false; withKey: true; }): [string, WebpackModule];
export function getById<T>(id: string | number, options?: WebpackSearchOptions & { raw: true; all: true; withKey: true; }): [string, WebpackModule][];
export function getById(id: string | number, options: WebpackSearchOptions = { raw: false, all: false, withKey: false }): any {
    const result = getModule(
        Filters.byId(id),
        options
    );

    if(!result && typeof cache[id] !== 'undefined') {
        logger.warn(`Failed to locate module id ${ id } via \`#getModule\` but found via \`.cache\`, if you see this message please report it!`);
    }

    return result;
}


type WithOptions<T, B> = [...T[], B] | T[];
function seperateOptionsAndValues<T, B>(...values: WithOptions<T, B>): [values: T[], options: B | null] {
    const optionIdx = values.findIndex((v) => typeof v === 'object');
    if(optionIdx !== -1) {
        const options = values[optionIdx];
        values.splice(optionIdx, 1)
        return [values, options] as [values: T[], options: B];
    }

    return [values, null] as [values: T[], options: null];
}

export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }>): T;
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }>): T[];
export function getByStrings(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; withKey: false; all?: false; }>): WebpackModule;
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all: true; withKey?: false; }>): WebpackModule[];
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }>): [string, T];
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all: true; withKey: true; }>): [string, T][];
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all?: false; withKey: true; }>): [string, WebpackModule];
export function getByStrings<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all: true; withKey: true; }>): [string, WebpackModule][];
export function getByStrings(...strings: WithOptions<string, WebpackSearchOptions>): any {
    const [values, options] = seperateOptionsAndValues(...strings);
    return getModule(
        Filters.byStrings(...values),
        options || {}
    );
}

export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }>): T;
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }>): T[];
export function getByRegex(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw: true; withKey: false; all?: false; }>): WebpackModule;
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw: true; all: true; withKey?: false; }>): WebpackModule[];
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }>): [string, T];
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw?: false; all: true; withKey: true; }>): [string, T][];
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw: true; all?: false; withKey: true; }>): [string, WebpackModule];
export function getByRegex<T>(...strings: WithOptions<RegExp, WebpackSearchOptions & { raw: true; all: true; withKey: true; }>): [string, WebpackModule][];
export function getByRegex(...strings: WithOptions<RegExp, WebpackSearchOptions>): any {
    const [values, options] = seperateOptionsAndValues(...strings);
    return getModule(
        Filters.byRegex(...values),
        options || {}
    );
}

export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }>): T;
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }>): T[];
export function getBySource(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw: true; withKey: false; all?: false; }>): WebpackModule;
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw: true; all: true; withKey?: false; }>): WebpackModule[];
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }>): [string, T];
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw?: false; all: true; withKey: true; }>): [string, T][];
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw: true; all?: false; withKey: true; }>): [string, WebpackModule];
export function getBySource<T>(...strings: WithOptions<string | RegExp, WebpackSearchOptions & { raw: true; all: true; withKey: true; }>): [string, WebpackModule][];
export function getBySource(...strings: WithOptions<string | RegExp, WebpackSearchOptions>): any {
    const [values, options] = seperateOptionsAndValues(...strings);
    return getModule(
        Filters.bySource(...values),
        options || {}
    );
}

export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }>): T;
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }>): T[];
export function getByKeys(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; withKey: false; all?: false; }>): WebpackModule;
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all: true; withKey?: false; }>): WebpackModule[];
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }>): [string, T];
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw?: false; all: true; withKey: true; }>): [string, T][];
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all?: false; withKey: true; }>): [string, WebpackModule];
export function getByKeys<T>(...strings: WithOptions<string, WebpackSearchOptions & { raw: true; all: true; withKey: true; }>): [string, WebpackModule][];
export function getByKeys(...strings: WithOptions<string, WebpackSearchOptions>): any {
    const [values, options] = seperateOptionsAndValues(...strings);
    return getModule(
        Filters.byKeys(...values),
        options || {}
    );
}

export function getModule(filter: WebpackFilter, options: WebpackSearchOptions): any;
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }): T;
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }): T[];
export function getModule(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; withKey: false; all?: false; }): WebpackModule;
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all: true; withKey?: false; }): WebpackModule[];
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }): [string, T];
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all: true; withKey: true; }): [string, T][];
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all?: false; withKey: true; }): [string, WebpackModule];
export function getModule<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all: true; withKey: true; }): [string, WebpackModule][];
export function getModule(filter: WebpackFilter, options: WebpackSearchOptions = { raw: false, all: false, withKey: false }): any {
    const results = [];

    for(const key in cache) {
        const mod = cache[key];
        const { exports, loaded } = mod;

        if(!exports || !loaded) {
            continue;
        }

        // no exports or if its the window then skip it
        // this comes from BetterDiscord's webpack
        // not sure if it's major preformance increase here
        // but might as well keep it
        if(
            !exports
            || exports === window
            || exports == document.documentElement
            || exports[Symbol.toStringTag] === 'DOMTokenList'
        ) {
            continue;
        }

        if(typeof exports !== 'object') {
            continue;
        }

        filter = Filters.wrap(filter);

        if(filter(mod.exports, mod, mod.id)) {
            if(options.raw) results.push(mod);
            else if(options.withKey) results.push([key, mod]);
            else results.push(mod.exports);

            if(!options.all) {
                return results[0];
            }
        }

        for(const innerKey in exports) {
            const inner = exports[innerKey];
            if(inner && filter(inner, mod, mod.id)) {
                if(options.raw) results.push(mod);
                else if(options.withKey) results.push([innerKey, exports]);
                else results.push(inner);

                if(!options.all) {
                    return results[0];
                }
            }
        }
    }

    return !options.all ? null : results;
}

export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw: true; }): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw?: false; withKey?: false; }): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw?: false; withKey?: false; }): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw?: false; }): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw?: false; withKey: true; }): Promise<void>;
export async function waitForLazy<T>(filter: WebpackFilter, callback: LazyCallback<T>, options?: WebpackSearchOptions & { raw?: false; withKey: true; }): Promise<void>;
export async function waitForLazy(filter: WebpackFilter, callback: LazyCallback<any>, options: WebpackSearchOptions = { raw: false, withKey: false }): Promise<void> {
    const existing = getModule(filter, options);
    if(existing) {
        return void callback(existing);
    }

    const wrappedCb = (result: any) => new Promise((resolve) => {
        resolve(callback(result));
    });

    moduleListeners.set(filter, wrappedCb);
}

export async function getModuleLazy(filter: WebpackFilter, options: WebpackSearchOptions): Promise<any>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey?: false; }): Promise<T>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all: true; withKey?: false; }): Promise<T[]>;
export async function getModuleLazy(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; withKey: false; all?: false; }): Promise<WebpackModule>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all: true; withKey?: false; }): Promise<WebpackModule[]>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all?: false; withKey: true; }): Promise<[string, T]>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw?: false; all: true; withKey: true; }): Promise<[string, T][]>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all?: false; withKey: true; }): Promise<[string, WebpackModule]>;
export async function getModuleLazy<T>(filter: WebpackFilter, options?: WebpackSearchOptions & { raw: true; all: true; withKey: true; }): Promise<[string, WebpackModule][]>;
export async function getModuleLazy(filter: WebpackFilter, options: WebpackSearchOptions = { raw: false, all: false, withKey: false }): Promise<any> {
    const existing = getModule(filter, options);
    if(existing) {
        return existing;
    }

    const [waitFor, resolver] = wait<any>();
    const wrappedCb = (result: any) => resolver(result);

    moduleListeners.set(filter, wrappedCb);

    return waitFor;
}