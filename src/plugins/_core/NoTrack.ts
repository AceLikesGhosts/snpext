import Logger from '@/utils/logger';
import { Patcher } from '@/utils/patcher/patcher';
import definePlugin from '@/utils/plugin';
import { getByKeys, getByStrings, getModule } from '@/webpack';

declare const __SENTRY__: {
    globalEventProcessors: unknown[];
    logger: {
        disable(): void;
    },
};

interface MetricCollector {

}

interface ActivityDetector {
    destroy(): void;
    getIsActive(): boolean;
    getSecondsSinceLastActivity(): number;
    onActivity(): unknown;
    registerListeners(): void;
    inactiveThresholdInSecond: number;
    lastActivityTimestamp: number;
}

interface NetworkHandler {
    sendRequest(): void;
}

interface AnalyticsModule {
    metricCollector: MetricCollector;
    activityDetector: ActivityDetector;
    networkHandler: NetworkHandler;
    increment(): void;
}

interface WindowSentry {
    __SENTRY__: Sentry;
}

interface Sentry {
    globalEventProccessors: (() => unknown)[];
    hub: SentryHub;
}

interface SentryHub {
    getClient(): SentryClient;
}

interface SentryClientOptions {
    autoSessionTracking: boolean;
    enableTracing: boolean;
    tracesSampleRate: number;
}

interface SentryClient {
    getOptions(): SentryClientOptions;
}

const patcher = Patcher.new('NoTrack');
const logger = Logger.new('plugin', 'NoTrack');
let originalDurationTime: number = Date.now();
let activityMod: AnalyticsModule;

export default definePlugin({
    name: 'NoTrack',
    version: '1.0.0',
    description: 'Disables analytics, and error tracking.',
    isRequired: true,
    patches: [
        {
            find: /initBlizzard must be called prior to calling logEvent"\);/,
            replacements: [
                {
                    find: /(initBlizzard must be called prior to calling logEvent"\);)/,
                    replace: `$1return;`
                }
            ]
        }
    ],
    start() {
        activityMod = getByKeys<AnalyticsModule>('increment', 'metricCollector', 'activityDetector',);

        if(!activityMod) {
            throw new Error('NoTrack ~ Failed to find AnalyticsModule');
        }

        patcher.instead(activityMod.networkHandler, 'sendRequest', () => new Promise<void>((r) => { r(); }));
        patcher.instead(Object.getPrototypeOf(activityMod.networkHandler), 'sendRequest', () => new Promise<void>((r) => { r(); }));
        patcher.instead(activityMod.activityDetector, 'getSecondsSinceLastActivity', () => 0);
        patcher.instead(activityMod.activityDetector, 'getIsActive', () => true);

        logger.verbose('patched activityDetector lastActivityTimestamp');
        Object.defineProperty(
            activityMod.activityDetector,
            'lastActivityTimestamp',
            {
                get() {
                    return Date.now();
                },
                set(setTime: number) {
                    originalDurationTime = setTime;
                },
                configurable: true,
                enumerable: true,
            }
        );

        activityMod?.activityDetector?.destroy();

        const sentry = (
            window as unknown as WindowSentry
        )?.__SENTRY__;

        if(!sentry) {
            throw new Error('NoTrack ~ Failed to locate Sentry to disable it');
        }

        const client = sentry.hub.getClient();
        client.getOptions().autoSessionTracking = false;
        client.getOptions().enableTracing = false;
        client.getOptions().tracesSampleRate = 0;
    },
    stop() {
        logger.verbose('unpatching all');
        patcher.unpatchAll();

        logger.verbose('unpatched activityDetector lastActivityTimestamp');
        Object.defineProperty(
            activityMod.activityDetector,
            'lastActivityTimestamp',
            {
                get() {
                    return originalDurationTime;
                },
                set(setTime: number) {
                    originalDurationTime = setTime;
                },
            }
        );
    }
});