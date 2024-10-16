import { INTERNAL_STORAGE_PREFIX, STORAGE_RECIEVING_MESSAGES_TYPES, STORAGE_RECIEVING_MESSAGES_TYPES_KEYS, STORAGE_SENDING_MESSAGES_TYPES, STORAGE_SENDING_MESSAGES_TYPES_KEYS } from './common';

function respond(
    type: string,
    data: Record<PropertyKey, unknown>
) {
    window.postMessage({
        type,
        data
    });
}

window.addEventListener('message', (ev) => {
    if(
        !STORAGE_SENDING_MESSAGES_TYPES_KEYS.includes(ev.data.type)
    ) {
        return;
    }

    // opening settings page is handled in
    // ./serviceWorker.ts, not here!
    // but we forward the request here..
    // because chrome sucks!
    if(ev.data.type === STORAGE_SENDING_MESSAGES_TYPES.OPEN_SETTINGS_PAGE) {
        chrome.runtime.sendMessage({ type: STORAGE_SENDING_MESSAGES_TYPES.OPEN_SETTINGS_PAGE });
        return;
    }

    const { key, value } = ev.data.data;
    const prefix = INTERNAL_STORAGE_PREFIX[ev.data.type as keyof typeof INTERNAL_STORAGE_PREFIX];

    chrome.storage.sync.set({
        [`${ prefix }.${ key }`]: value
    }).then(() => {
        return respond(
            STORAGE_RECIEVING_MESSAGES_TYPES.SUCCESSFUL,
            { success: true }
        );
    });
});