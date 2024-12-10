import { openDB, type IDBPDatabase } from 'idb';
import pkg from './pkg';
import type { PluginStatus } from '@/plugins/api';

const idbDb: Promise<IDBPDatabase<unknown>> = openDB(pkg.name, 1, {
    upgrade(db, oldversion) {
        if(oldversion === 0) {
            db.createObjectStore('settings');
            db.createObjectStore('pluginStatus');
        }
    },
});

export const setPluginStatus = async (key: string, status: PluginStatus) => {
    await (await idbDb).put('pluginStatus', status, key);
};

export const getPluginStatus = async (key: string): Promise<PluginStatus | undefined> => {
    return (await idbDb).get('pluginStatus', key);
};

export const get = async <T>(key: string): Promise<T | undefined> => {
    return (await idbDb).get('settings', key);
};

export const set = async (key: string, value: unknown) => {
    await (await idbDb).put('settings', value, key);
};