// mostly from https://github.com/Swishilicous/discord-types/blob/main/other/WebpackInstance.d.ts

import type { WebpackInstance } from '@/webpack/types';

declare global {
    interface Window {
        webpackChunk_snapchat_web_calling_app: WebpackInstance;
    }

    export const IS_DEV: boolean;
    export const LFOR: Record<string, boolean>;

    export const snpext: {
        webpack: {
            common: typeof import('./webpack/common')
        }
    }

    export const browser: typeof chrome | undefined;
}

export { };