export type StrOrReg = string | RegExp;

// mostly from https://github.com/Swishilicous/discord-types/blob/main/other/WebpackInstance.d.ts

export type WebpackModule = {
    id: number | string;
    loaded: boolean;
    exports: Record<PropertyKey, any>;
};

export type WebpackModuleMap = {
    [id: string]: WebpackModule;
};

export type WebpackInstance = [
    any | any[],
    WebpackModuleMap,
    (r: WebpackRequire) => any
][];

export type WebpackRequire = {
    (modId: string | number | Symbol): any;
    m: {
        [id: string]: (
            module: unknown,
            exports: unknown,
            require2: unknown
        ) => unknown;
    };
    c: WebpackModuleMap;
};

export type PlaintextReplaceFunction = (original: string) => string;
export type PlaintextPatches = {
    find: StrOrReg;
    replacements: PlaintextMatch[];
};

export type PlaintextMatch = {
    find: StrOrReg;
    replace: string | ((substr: string, ...groups: string[]) => string);
};

export type WebpackFilter = (
    exports: Record<PropertyKey, any>,
    mod: WebpackModule,
    id: string | number,
) => boolean;

export type WebpackSearchOptions = {
    raw?: boolean;
    all?: boolean;
    withKey?: boolean;
};

export type LazyCallback<T = any> = (
    output: T
) => void;