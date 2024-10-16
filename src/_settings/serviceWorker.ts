import { STORAGE_SENDING_MESSAGES_TYPES } from './common';

chrome.runtime.onMessage.addListener((ev) => {
    if(ev.type !== STORAGE_SENDING_MESSAGES_TYPES.OPEN_SETTINGS_PAGE) {
        return;
    }

    chrome.tabs.create({
        url: chrome.runtime.getURL('settings.html'),
        active: true
    });
});

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('settings.html'),
        active: true
    });
});