import { getPluginStatus, setPluginStatus } from '@/utils/storage';
import { PluginStatus, type IPlugin } from '.';
import plugins from '~plugins';
import Logger from '@/utils/logger';

const internalPluginHelperLogger = Logger.new('dev', 'plugin~helper');

export function get(pluginName: string): IPlugin | null {
    return plugins[pluginName] || null;
}

export async function status(pluginName: string): Promise<PluginStatus | null> {
    const plugin = get(pluginName);

    if(!plugin) {
        return null;
    }

    if(plugin.isRequired) {
        return PluginStatus.ENABLED;
    }

    const currentStatus = await getPluginStatus(pluginName);
    internalPluginHelperLogger.verbose(`${ pluginName } currentStatus ${ currentStatus ?? PluginStatus.DISABLED } (actual ${ currentStatus })`);
    return currentStatus ?? PluginStatus.DISABLED;
}

/**
 * Starts a plugin, alongside enables it within the settings.
 * @returns The new status of the plugin, or null if it does not exist.
 */
export async function start(pluginName: string): Promise<PluginStatus | null> {
    return internalToggle(pluginName, PluginStatus.ENABLED);
}

/**
 * Disables a plugin, alongside enables it within the settings.
 * @returns The new status of the plugin, or null if it does not exist.
 */
export async function stop(pluginName: string): Promise<PluginStatus | null> {
    return internalToggle(pluginName, PluginStatus.DISABLED);
}

/**
 * Toggles a plugin, alongside enables it within the settings.
 * @returns The new status of the plugin, or null if it does not exist.
 */
export async function toggle(pluginName: string): Promise<PluginStatus | null> {
    const currentStatus = await status(pluginName);
    if(currentStatus === PluginStatus.CRASHED) {
        return null;
    }

    if(currentStatus === PluginStatus.DISABLED) {
        return start(pluginName);
    }

    return stop(pluginName);
}

async function internalToggle(
    pluginName: string,
    desiredStatus: PluginStatus,
) {
    const plugin = get(pluginName);
    if(!plugin) {
        return null;
    }

    const currentStatus = await status(pluginName);

    if(currentStatus === PluginStatus.CRASHED) {
        return PluginStatus.CRASHED;
    }

    if(plugin.isRequired) {
        return PluginStatus.ENABLED;
    }

    if(currentStatus === desiredStatus) {
        return currentStatus;
    }

    try {
        plugin?.[
            desiredStatus === PluginStatus.ENABLED
                ? 'start'
                : 'stop'
        ]?.();

        await setPluginStatus(plugin.name, desiredStatus);
        return desiredStatus;
    } catch(err) {
        if(desiredStatus !== PluginStatus.DISABLED) plugin?.stop?.();
        await setPluginStatus(plugin.name, PluginStatus.CRASHED);
        return PluginStatus.CRASHED;
    }
}