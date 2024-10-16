import plugins from '~plugins-meta';
import { PluginStatus, type IPlugin } from '@/plugins/api/types';
import { INTERNAL_STORAGE_PREFIX, STORAGE_SENDING_MESSAGES_TYPES } from './common';

type MetaPlugin = IPlugin & {
    start?: boolean;
    stop?: boolean;
    patches?: boolean;
} & Record<string, boolean>;

function togglePluginStatus(
    plugin: MetaPlugin,
    pluginStatus: PluginStatus,
    pluginStatusToggle: HTMLInputElement
) {
    let outputStatus: PluginStatus = PluginStatus.DISABLED;
    if(pluginStatus === PluginStatus.ENABLED) outputStatus = PluginStatus.DISABLED;
    else outputStatus = PluginStatus.ENABLED;

    pluginStatusToggle.checked = outputStatus === PluginStatus.ENABLED ? true : false;
    window.postMessage({
        type: STORAGE_SENDING_MESSAGES_TYPES.REMOTE_PLUGIN_STATUS_UPDATE,
        data: {
            pluginName: plugin.name,
            status: outputStatus
        }
    });
}

async function createPluginDetails(plugin: MetaPlugin) {
    const pluginDiv = document.createElement('li');

    const pluginNameHeader = document.createElement('h1');
    pluginNameHeader.textContent = plugin.name;

    const pluginVersionSubtext = document.createElement('p');
    pluginVersionSubtext.textContent = `v${ plugin.version }`;

    const pluginStatusToggle = document.createElement('input');
    pluginStatusToggle.type = 'checkbox';

    const storageKey = `${ INTERNAL_STORAGE_PREFIX['SYNC_PLUGIN_STATUS'] }.${ plugin.name }`;
    const pluginStatus = (await chrome.storage.sync.get(storageKey))?.[storageKey];

    if(pluginStatus === PluginStatus.ENABLED) {
        pluginStatusToggle.checked = true;
    } else if(pluginStatus === PluginStatus.DISABLED) {
        pluginStatusToggle.checked = false;
    } else if(pluginStatus === PluginStatus.CRASHED) {
        pluginStatusToggle.checked = false;
        pluginStatusToggle.disabled = true;
    }

    pluginStatusToggle.addEventListener('click', () => togglePluginStatus(plugin, pluginStatus, pluginStatusToggle));

    const pluginDescription = document.createElement('p');
    pluginDescription.innerText = plugin.description ?? 'No description.';

    const pluginDetailsWrapper = document.createElement('div');
    pluginDetailsWrapper.classList.add('pluginDetailsWrapper');
    pluginDetailsWrapper.appendChild(pluginNameHeader);
    pluginDetailsWrapper.appendChild(pluginVersionSubtext);
    pluginDetailsWrapper.appendChild(pluginStatusToggle);

    const pluginDescriptionWrapper = document.createElement('div');
    pluginDescriptionWrapper.appendChild(pluginDescription);

    pluginDiv.appendChild(pluginDetailsWrapper);
    pluginDiv.appendChild(pluginDescriptionWrapper);

    rootElement?.appendChild(pluginDiv);
}

const rootElement = document.getElementById('root') as HTMLDivElement | null;
const requiredPlugins: MetaPlugin[] = [];

for(const pluginName in plugins) {
    // the type casting is a hack to get types to
    // actually appear, typescript seems to die here?
    // probably an issue of how we're setting things up
    const plugin = plugins[pluginName] as MetaPlugin;

    if(plugin.isRequired) {
        requiredPlugins.push(plugin);
        continue;
    }

    createPluginDetails(plugin);
}