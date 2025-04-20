import { openDB, type IDBPDatabase } from 'idb';
import pkg from './pkg';
import type { PluginStatus } from '@/plugins/api';

export const IDB_SETTINGS_KEY = 'settings';
export const IDB_PLUGIN_STATUS_KEY = 'pluginStatus';

/* @internal */
export const idbDb: Promise<IDBPDatabase<unknown>> = openDB(pkg.name, 1, {
    upgrade(db, oldversion) {
        if(oldversion === 0) {
            db.createObjectStore(IDB_SETTINGS_KEY);
            db.createObjectStore(IDB_PLUGIN_STATUS_KEY);
        }
    },
});

export const setPluginStatus = async (key: string, status: PluginStatus) => {
    await (await idbDb).put(IDB_PLUGIN_STATUS_KEY, status, key);
};

export const getPluginStatus = async (key: string): Promise<PluginStatus | undefined> => {
    return (await idbDb).get(IDB_PLUGIN_STATUS_KEY, key);
};

export const get = async <T>(key: string): Promise<T | undefined> => {
    return (await idbDb).get(IDB_SETTINGS_KEY, key);
};

export const set = async (key: string, value: unknown) => {
    await (await idbDb).put(IDB_SETTINGS_KEY, value, key);
};