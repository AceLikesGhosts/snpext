export type AnyFunction = AnySyncFunction | AnyPromiseFunction;
export type AnySyncFunction = (...args: any[]) => any;
export type AnyPromiseFunction = (...args: any[]) => Promise<any>;

export type ObjectWithFunctions = Record<PropertyKey, AnyFunction>;
export type UnpatcherFunction = () => void;

// https://stackoverflow.com/a/64958728
export type Tail<T extends unknown[]> = T extends [infer Head, ...infer Tail] ? Tail : never;

export type BeforeCallback<P = any[], T = any> = (
    args: P,
    ctx: T
) => P | any[];

export type InsteadCallback<P = any[], T = any, R = any> = (
    args: P,
    original: AnyFunction,
    ctx: T
) => R;

export type AfterCallback<P = any[], T = any, R = any> = (
    args: P,
    result: R,
    ctx: T
) => R;

export type ObjectPatches = {
    original: Map<PropertyKey, AnyFunction>;
    patches: Map<PropertyKey, {
        before: BeforeCallback[];
        instead: InsteadCallback[];
        after: AfterCallback[];
    }>;
};


const OBJECT_PATCHES = new WeakMap<
    ObjectWithFunctions,
    ObjectPatches
>();

const PLUGIN_UNPATCHERS = new Map<
    string,
    UnpatcherFunction[]
>();

function replaceMethod<
    O extends ObjectWithFunctions,
    K extends keyof O,
>(
    obj: O,
    key: K,
    type: 'before' | 'instead' | 'after',
    modifier: AnySyncFunction,
): UnpatcherFunction {
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
                const newResult = a.call(this, args, original, this!);
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
    O extends ObjectWithFunctions,
    K extends keyof O,
>(
    obj: O,
    key: K,
    type: 'before' | 'instead' | 'after',
    modifier: AnySyncFunction,
): UnpatcherFunction {
    return replaceMethod(obj, key, type, modifier);
}

export function before<
    O extends ObjectWithFunctions,
    K extends keyof O,
    P = Parameters<O[K]>,
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
    O extends ObjectWithFunctions,
    K extends keyof O,
    R = ReturnType<O[K]> | undefined | void
>(
    pluginName: string,
    obj: O,
    key: K,
    fn: InsteadCallback<Parameters<O[K]>, ThisType<O[K]>, R>
): UnpatcherFunction {
    const unpatcher = patch(obj, key, 'instead', fn);
    appendPatcher(pluginName, unpatcher);
    return unpatcher;
}

export function after<
    O extends ObjectWithFunctions,
    K extends keyof O,
    R = ReturnType<O[K]>,
>(
    pluginName: string,
    obj: O,
    key: K,
    fn: AfterCallback<Parameters<O[K]>, ThisType<O[K]>, R>
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
        O extends ObjectWithFunctions,
        K extends keyof O,
        P = Parameters<O[K]>,
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
        O extends ObjectWithFunctions,
        K extends keyof O,
        R = ReturnType<O[K]> | undefined | void
    >(
        obj: O,
        key: K,
        fn: InsteadCallback<Parameters<O[K]>, ThisType<O[K]>, R>
    ): UnpatcherFunction {
        const unpatcher = patch(obj, key, 'instead', fn);
        appendPatcher(this.pluginName, unpatcher);
        return unpatcher;
    }

    public after<
        O extends ObjectWithFunctions,
        K extends keyof O,
        R = ReturnType<O[K]>,
    >(
        obj: O,
        key: K,
        fn: AfterCallback<Parameters<O[K]>, ThisType<O[K]>, R>
    ): UnpatcherFunction {
        const unpatcher = patch(obj, key, 'after', fn);
        appendPatcher(this.pluginName, unpatcher);
        return unpatcher;
    }
}