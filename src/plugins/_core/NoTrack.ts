import { assertType } from '@/utils/assert';
import Logger from '@/utils/logger';
import { Patcher } from '@/utils/patcher/patcher';
import definePlugin from '@/utils/plugin';
import { getByKeys } from '@/webpack';

type ConsoleWithPossibleSentry = {
    [K in keyof Console]: Console[K] & { __sentry_original__?: any; }
};

declare const __SENTRY__: {
    globalEventProcessors: unknown[];
    logger?: {
        disable?(): void;
    },
    hub?: {
        // extra identifiable data
        setExtras?(extras: {} | null): void;
        // default PII
        setUser?(user: {} | null): void;
        // tracking tags
        setTags(tags: {} | null): void;

        endSession?(): void;

        getClient?(): {
            close(code: number): void;

            autoSessionTracking: boolean;
            enableTracing: boolean;
            tracesSampleRate: number;
        };
        getScope?(): {
            clear?(): void;
            setFingerprint?(fingerprint: {} | null): void;
        };
    };
};

interface AnalyticsModule {
    activityDetector: {
        destroy(): void;
        getIsActive(): boolean;
        getSecondsSinceLastActivity(): number;
        onActivity(): unknown;
        registerListeners(): void;
        inactiveThresholdInSecond: number;
        lastActivityTimestamp: number;
    };
    networkHandler: {
        sendRequest(): void;
    };
    increment(): void;
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

        const snapchatSentry = __SENTRY__;

        if(!snapchatSentry) {
            throw new Error('NoTrack ~ Failed to locate Sentry to disable it');
        }

        __SENTRY__.globalEventProcessors.splice(0, __SENTRY__.globalEventProcessors.length);
        __SENTRY__.logger?.disable?.();

        const SENTRY_HUB = __SENTRY__.hub;
        if(SENTRY_HUB) {
            SENTRY_HUB.getClient?.()?.close?.(0);

            const scope = SENTRY_HUB.getScope?.();
            if(scope) {
                scope?.clear?.();
                scope?.setFingerprint?.(null);
            }

            SENTRY_HUB?.setUser?.(null);
            SENTRY_HUB?.setTags?.(null);
            SENTRY_HUB?.setExtras?.(null);

            SENTRY_HUB?.endSession?.();
        }

        assertType<ConsoleWithPossibleSentry>(console);
        for(const key in console) {
            assertType<keyof Console>(key);

            if(Object.hasOwn(console[key], '__sentry_original__')) {
                console[key] = console[key].__sentry_original__;
            }
        }
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