import path from 'path';
import { name as pkgName, version as pkgVersion, description as pkgDescription } from '../../package.json';
import fs from 'fs/promises';
import type { Plugin } from 'esbuild';
import { mkdir } from 'fs/promises';

type Manifest = ReturnType<typeof chrome.runtime.getManifest>;

//#region manifest
const SNAPCHAT_URLS = [
    "http://web.snapchat.com/*",
    "https://web.snapchat.com/*",
    "http://*.snapchat.com/*",
    "https://*.snapchat.com/*",
];

const MANIFEST = {
    "manifest_version": 3,
    "name": pkgName,
    "version": pkgVersion,
    "description": pkgDescription,
    "content_scripts": [
        {
            "matches": [
                "*://web.snapchat.com/*",
                "*://www.snapchat.com/web"
            ],
            "all_frames": true,
            "js": ["entry.js"],
            "run_at": "document_start",
            "world": "MAIN"
        }
    ],
    "permissions": [
        "declarativeNetRequest",
        "storage"
    ],
    "host_permissions": SNAPCHAT_URLS,
    "web_accessible_resources": [
        {
            "resources": ["*.map"],
            "matches": SNAPCHAT_URLS
        }
    ],
    "content_security_policy": {
        "extension_pages": "script-src 'self'; object-src 'self'; frame-ancestors 'none';"
    },
    "declarative_net_request": {
        "rule_resources": [
            {
                "id": "analytics_blocking_1",
                "enabled": true,
                "path": "analytics_rule.json"
            }
        ]
    },
    "action": {}
} as Manifest;

const ANALYTICS_RULE = [
    {
        "id": 1,
        "priority": 1,
        "action": {
            "type": "block"
        },
        "condition": {
            "urlFilter": "||web.snapchat.com/web-analytics-*/*",
            "resourceTypes": ["main_frame", "script", "xmlhttprequest"]
        }
    },
    {
        "id": 2,
        "priority": 1,
        "action": {
            "type": "block"
        },
        "condition": {
            "urlFilter": "||gcp.api.snapchat.com/web/metrics",
            "resourceTypes": ["main_frame", "script", "xmlhttprequest"]
        }
    },
    {
        "id": 3,
        "priority": 1,
        "action": {
            "type": "block"
        },
        "condition": {
            "urlFilter": "||sentry.sc-prod.net/*",
            "resourceTypes": ["main_frame", "script", "xmlhttprequest"]
        }
    },
    {
        "id": 4,
        "priority": 1,
        "action": {
            "type": "block"
        },
        "condition": {
            "urlFilter": "||web.snapchat.com/web-blizzard/web/send",
            "resourceTypes": ["main_frame", "script", "xmlhttprequest"]
        }
    },
    {
        "id": 5,
        "priority": 1,
        "action": {
            "type": "block"
        },
        "condition": {
            "urlFilter": "||web.snapchat.com/graphene/web",
            "resourceTypes": ["main_frame", "script", "xmlhttprequest"]
        }
    }
];
//#endregion manifest

async function fileSame(name: string, content: string) {
    try {
        const data = await fs.readFile(name, { encoding: 'utf-8' });
        return data === content;
    }
    catch(_) {
        return false;
    }
}


export async function createIfNotEqual(
    name: string,
    content: string
) {
    const file = path.join(__dirname, '..', '..', 'dist', name);

    if(await fileSame(file, content)) {
        return;
    }

    await fs.writeFile(file, content, {
        encoding: 'utf-8',
    });
}

export default {
    name: 'manifest',
    setup(build) {
        build.onStart(async () => {
            try {
                await mkdir(path.join(__dirname, '..', '..', 'dist'));
            } catch(err) {
                // don't care
            }
            await createIfNotEqual('manifest.json', JSON.stringify(MANIFEST));
            await createIfNotEqual('analytics_rule.json', JSON.stringify(ANALYTICS_RULE));
        });
    },
} as Plugin;