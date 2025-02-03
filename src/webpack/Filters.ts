import { stringify } from '@/utils/stringify';
import type { WebpackFilter } from './types';

export const Filters = {
    combine: (...filters: WebpackFilter[]) => {
        return (exports, mod, id) => {
            for(const filter of filters) {
                if(!filter(exports, mod, id)) {
                    return false;
                }
            }

            return true;
        };
    },
    wrap: (filter: WebpackFilter) => {
        return (exports, mod, id) => {
            try {
                return filter(exports, mod, id);
            } catch(err) {
                console.error('something went wrong!', err);
                return false;
            }
        };
    },
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
    byStrings: (...strings: string[]) => {
        return (exports) => {
            const stringified = stringify(exports);

            for(const str of strings) {
                if(!stringified.includes(str)) {
                    return false;
                }
            }

            return true;
        };
    },
    bySource: (...matchers: (string | RegExp)[]) => {
        return (exports) => {
            if(typeof exports !== 'function') {
                return false;
            }

            const stringified = stringify(exports);
            return matchers.every(matcher =>
                typeof matcher === 'string'
                    ? stringified.includes(matcher)
                    : matcher.test(stringified)
            );
        };
    },
    byRegex: (...regex: RegExp[]) => {
        return (exports) => {
            const stringified = stringify(exports);
            return regex.every(matcher => matcher.test(stringified));
        };
    }
} satisfies Record<PropertyKey, (...args: any[]) => WebpackFilter>;