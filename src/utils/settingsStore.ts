import ReactiveStore, { type StoreListener } from './reactiveStore/store';

export const SETTINGS_STORE = new ReactiveStore<
    Record<PropertyKey, unknown>
>(
    {},
    new Set()
);

export default function makePluginSettings<T>(
    settings: T
) {
    return (pluginName: string) => {
        SETTINGS_STORE.store[pluginName] = settings;
        return SETTINGS_STORE.store[pluginName] as T;
    };
}