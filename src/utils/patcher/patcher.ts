import { assertType } from '../assert';
import type {
    AfterCallback,
    AnyFunction,
    AnySyncFunction,
    BeforeCallback,
    InsteadCallback,
    ObjectPatches,
    ObjectWithFunctions,
    UnpatcherFunction
} from './PatcherTypes';

const OBJECT_PATCHES = new WeakMap<
    Record<PropertyKey, AnyFunction>,
    ObjectPatches
>();

const PLUGIN_UNPATCHERS = new Map<
    string,
    UnpatcherFunction[]
>();

function replaceMethod<
    O extends Record<PropertyKey, AnyFunction>,
    K extends ObjectWithFunctions<O>,
>(
    obj: O,
    key: K,
    type: 'before' | 'instead' | 'after',
    modifier: AnySyncFunction
): UnpatcherFunction {
    assertType<Record<PropertyKey, AnyFunction>>(obj);

    let objPatches: ObjectPatches;

    if(OBJECT_PATCHES.has(obj)) {
        objPatches = OBJECT_PATCHES.get(obj)!;
    } else {
        objPatches = {
            original: new Map(),
            patches: new Map(),
        };

        OBJECT_PATCHES.set(obj, objPatches);
    }

    if(!objPatches.patches.has(key)) {
        objPatches.patches.set(key, {
            before: [],
            instead: [],
            after: []
        });
    }

    objPatches.patches.get(key)?.[type].push(modifier);

    if(!objPatches.original.get(key)) {
        const original = obj[key];
        objPatches.original.set(key, original);

        obj[key] = function (this: unknown, ...args: unknown[]): unknown {
            const patches = objPatches.patches.get(key)!;

            for(const b of patches.before) {
                const newArgs = b.call(this, args, this);
                if(Array.isArray(newArgs)) {
                    args = newArgs;
                }
            }

            let res: unknown;

            if(patches.instead.length === 0) {
                res = original.apply(this, args);
            } else {
                for(const i of patches.instead) {
                    const newResult = i.call(this, args, original, this!);
                    if(newResult !== void 0) {
                        res = newResult;
                    }
                }
            }

            for(const a of patches.after) {
                const newResult = a.call(this, args, res, this!);
                if(newResult !== void 0) {
                    res = newResult;
                }
            }

            return res;
        } as O[K];

        Object.defineProperties(obj[key], Object.getOwnPropertyDescriptors(original));
        obj[key].toString = original.toString.bind(original);
    }

    return () => {
        const p = OBJECT_PATCHES.get(obj);
        p?.patches.delete(key);

        if(p?.patches.size === 0) {
            obj[key] = p.original.get(key) as O[K];
            OBJECT_PATCHES.delete(obj);
        }
    };
}


function patch<
    O,
    K extends ObjectWithFunctions<O>,
>(
    obj: O,
    key: K,
    type: 'before' | 'instead' | 'after',
    modifier: AnySyncFunction,
): UnpatcherFunction {
    return replaceMethod(obj as Record<PropertyKey, AnyFunction>, key, type, modifier);
}

export function before<
    O,
    K extends ObjectWithFunctions<O>,
    P = Parameters<O[K] extends AnyFunction ? O[K] : () => unknown>,
>(
    pluginName: string,
    obj: O,
    key: K,
    fn: BeforeCallback<P, ThisType<O[K]>>
): UnpatcherFunction {
    const unpatcher = patch(obj, key, 'before', fn);
    appendPatcher(pluginName, unpatcher);
    return unpatcher;
}

export function instead<
    O,
    K extends ObjectWithFunctions<O>,
    R = ReturnType<O[K] extends AnyFunction ? O[K] : () => unknown> | undefined | void
>(
    pluginName: string,
    obj: O,
    key: K,
    fn: InsteadCallback<Parameters<O[K] extends AnyFunction ? O[K] : () => unknown>, ThisType<O[K]>, R>
): UnpatcherFunction {
    const unpatcher = patch(obj, key, 'instead', fn);
    appendPatcher(pluginName, unpatcher);
    return unpatcher;
}

export function after<
    O,
    K extends ObjectWithFunctions<O>,
    R = ReturnType<O[K] extends AnyFunction ? O[K] : () => unknown>,
>(
    pluginName: string,
    obj: O,
    key: K,
    fn: AfterCallback<Parameters<O[K] extends AnyFunction ? O[K] : () => unknown>, ThisType<O[K]>, R>
): UnpatcherFunction {
    const unpatcher = patch(obj, key, 'after', fn);
    appendPatcher(pluginName, unpatcher);
    return unpatcher;
}

function appendPatcher(pluginName: string, unpatcher: UnpatcherFunction) {
    if(!PLUGIN_UNPATCHERS.has(pluginName)) {
        PLUGIN_UNPATCHERS.set(pluginName, [
            () => {
                unpatcher();
                PLUGIN_UNPATCHERS.get(pluginName)?.splice(0, 1);
            }
        ]);
    } else {
        const unpatchers = PLUGIN_UNPATCHERS.get(pluginName)!;
        unpatchers.push(
            () => {
                unpatcher();
                PLUGIN_UNPATCHERS.get(pluginName)?.splice(unpatchers.length - 1, 1);
            }
        );
    }
}

export function unpatchAll(pluginName: string) {
    if(!PLUGIN_UNPATCHERS.has(pluginName)) {
        return;
    }

    const unpatchers = PLUGIN_UNPATCHERS.get(pluginName)!;
    for(const unpatcher of unpatchers) {
        unpatcher();
    }
}

export class Patcher {
    public constructor(private readonly pluginName: string) { }

    public static new(pluginName: string): Patcher {
        return new Patcher(pluginName);
    }

    public unpatchAll() {
        if(!PLUGIN_UNPATCHERS.has(this.pluginName)) {
            return;
        }

        const unpatchers = PLUGIN_UNPATCHERS.get(this.pluginName)!;
        for(const unpatcher of unpatchers) {
            unpatcher();
        }
    }

    public before<
        O,
        K extends ObjectWithFunctions<O>,
        P = Parameters<O[K] extends AnyFunction ? O[K] : () => unknown>,
    >(
        obj: O,
        key: K,
        fn: BeforeCallback<P, ThisType<O[K]>>
    ): UnpatcherFunction {
        const unpatcher = patch(obj, key, 'before', fn);
        appendPatcher(this.pluginName, unpatcher);
        return unpatcher;
    }

    public instead<
        O,
        K extends ObjectWithFunctions<O>,
        R = ReturnType<O[K] extends AnyFunction ? O[K] : () => unknown> | undefined | null,
    >(
        obj: O,
        key: K,
        fn: InsteadCallback<Parameters<O[K] extends AnyFunction ? O[K] : () => any>, ThisType<O[K]>, R>
    ): UnpatcherFunction {
        const unpatcher = patch(obj, key, 'instead', fn);
        appendPatcher(this.pluginName, unpatcher);
        return unpatcher;
    }

    public after<
        O,
        K extends ObjectWithFunctions<O>,
        R = ReturnType<O[K] extends AnyFunction ? O[K] : () => unknown>,
    >(
        obj: O,
        key: K,
        fn: AfterCallback<Parameters<O[K] extends AnyFunction ? O[K] : () => unknown>, ThisType<O[K]>, R>
    ): UnpatcherFunction {
        const unpatcher = patch(obj, key, 'after', fn);
        appendPatcher(this.pluginName, unpatcher);
        return unpatcher;
    }
}