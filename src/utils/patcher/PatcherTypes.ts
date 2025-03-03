export type AnyFunction = AnySyncFunction | AnyPromiseFunction;
export type AnySyncFunction = (...args: any[]) => any;
export type AnyPromiseFunction = (...args: any[]) => Promise<any>;

export type UnpatcherFunction = () => void;
export type ObjectWithFunctions<T> = {
    [K in keyof T]: T[K] extends AnyFunction ? K : never
}[keyof T];

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