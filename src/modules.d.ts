declare module '~plugins' {
    import type { IPlugin } from './plugins/api/types';

    declare const plugins: Record<string, IPlugin>;
    export = plugins;
}

declare module '~plugins-meta' {
    import type { IPlugin } from './plugins/api/types';

    declare const plugins: Record<
        string,
        IPlugin | {
            start?: boolean;
            stop?: boolean;
            patches?: boolean;
        } | Record<string, boolean>
    >;
    export = plugins;
}