import { parseArgs } from 'node:util';

export const args = parseArgs({
    args: process.argv.slice(2),
    options: {
        watch: {
            type: 'boolean',
            short: 'w',
            default: false
        },
        dev: {
            type: 'boolean',
            short: 'd',
            default: false
        },
        verbose: {
            type: 'boolean',
            short: 'v',
            default: true
        },
        /**
         * what plugins to have verbose logs enabled for
         */
        lfor: {
            type: 'string',
            default: '*'
        }
    }
});