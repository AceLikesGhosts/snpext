import pkg from './pkg';

export const LOGGER_COLOURS = {
    log: 'color: white;',
    warn: 'color: yellow;',
    error: 'color: red;',
    debug: 'color: #ADD8E6;'
};

export default class Logger {
    public constructor(private readonly prefix: string = 'unknown') {
        if(
            !LFOR['*'] &&
            !LFOR[prefix]
        ) {
            this.verbose = () => void 0;
        }
    }

    public static new(...prefixes: string[]) {
        return new Logger(prefixes.join('~'));
    }

    private print(
        method: 'log' | 'warn' | 'error' | 'debug',
        ...data: Parameters<Console['log']>
    ) {
        try {
            const stringifiedData = data.map(item =>
                typeof item === 'object' ? JSON.stringify(item) : String(item)
            ).join(' ');

            console[method](
                `%c[${ pkg.name }/${ this.prefix }] %c${ stringifiedData }`,
                'color: pink; font-weight: 900;',
                LOGGER_COLOURS[method]
            );
        } catch(error) {
            console.error('Error in print method:', error);
        }
    }

    public log(...data: Parameters<Console['log']>) {
        this.print('log', ...data);
    }

    public warn(...data: Parameters<Console['warn']>) {
        this.print('warn', ...data);
    }

    public error(...data: Parameters<Console['error']>) {
        this.print('error', ...data);
    }

    public verbose(...data: Parameters<Console['debug']>) {
        if(IS_DEV) {
            this.print('debug', ...data);
        }
    }
}