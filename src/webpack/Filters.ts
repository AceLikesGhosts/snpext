import type { WebpackFilter } from './types';

export const Filters = {
    byKeys: (...keys: string[]) => {
        return (exports) => {
            if(typeof exports !== 'object') {
                return false;
            }

            for(const key of keys) {
                if(!(key in exports)) {
                    return false;
                }
            }

            return true;
        };
    },
    byId: (id: string | number) => {
        return (_, __, modId) => modId === id;
    },
    byStrings: (strings: string[]) => {
        return (exports) => {
            const stringified = exports?.toString() ?? Object.prototype.toString.apply(exports);
            for(const str of strings) {
                if(!stringified.includes(str)) {
                    return false;
                }
            }

            return true;
        };
    },
    byRegex: (regex: RegExp) => {
        return (exports) => {
            const stringified = exports?.toString() ?? Object.prototype.toString.apply(exports);

            if(regex.test(stringified)) {
                return true;
            }

            return false;
        };
    }
} satisfies Record<PropertyKey, (...args: any[]) => WebpackFilter>;