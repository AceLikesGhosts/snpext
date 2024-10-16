import { openDB, type IDBPDatabase } from 'idb';
import pkg from './pkg';
import { STORAGE_RECIEVING_MESSAGES_TYPES, STORAGE_SENDING_MESSAGES_TYPES } from '@/_settings/common';
import type { PluginStatus } from '@/plugins/api';

const idbDb: Promise<IDBPDatabase<unknown>> = openDB(pkg.name, 1, {
    upgrade(db, oldversion) {
        if(oldversion === 0) {
            db.createObjectStore('settings');
            db.createObjectStore('pluginStatus');
        }
    },
});

function waitForMessage(type: string): Promise<unknown> {
    return new Promise((resolve) => {
        const listener = (ev: MessageEvent) => {
            if(ev.data.type === type) {
                window.removeEventListener('message', listener);
                resolve(ev.data.data);
            }
        };
        window.addEventListener('message', listener);
    });
}

function sendMessage(type: string, data: Record<PropertyKey, unknown>) {
    window.postMessage({ type, data: { ...data } });
    console.log('posting', { type, data: { ...data } });
    return waitForMessage(STORAGE_RECIEVING_MESSAGES_TYPES.SUCCESSFUL);
}

export const setPluginStatus = async (key: string, status: PluginStatus) => {
    await (await idbDb).put('pluginStatus', status, key);
    void sendMessage(
        STORAGE_SENDING_MESSAGES_TYPES.SYNC_PLUGIN_STATUS,
        { key, value: status }
    );
};

export const getPluginStatus = async (key: string): Promise<PluginStatus | undefined> => {
    return (await idbDb).get('pluginStatus', key);
};

export const get = async <T>(key: string): Promise<T | undefined> => {
    return (await idbDb).get('settings', key);
};

export const set = async (key: string, value: unknown) => {
    await (await idbDb).put('settings', value, key);
    void sendMessage(
        STORAGE_SENDING_MESSAGES_TYPES.SYNC_SETTINGS,
        { key, value }
    );
};

window.addEventListener('message', (ev) => {
    if(ev.data.type !== STORAGE_SENDING_MESSAGES_TYPES.REMOTE_PLUGIN_STATUS_UPDATE) {
        return;
    }

    const { pluginName, status } = ev.data.data;
    if(typeof pluginName !== 'string') {
        throw new Error('invalid pluginname provided by PLUGIN_STATUS_UPDATE ' + pluginName);
    }

    if(typeof status !== 'number') {
        throw new Error('invalid status provided by PLUGIN_STATUS_UPDATE ' + pluginName + ' : ' + status);
    }

    setPluginStatus(pluginName, status);
});