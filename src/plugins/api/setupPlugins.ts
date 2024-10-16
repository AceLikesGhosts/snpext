import type { PlaintextPatches } from '@/webpack/types';
import { PluginStatus, status, type IPlugin } from '.';
import { waitForWebpack } from '@/webpack';
import { assertType } from '@/utils/assert';
import { set } from '@/utils/storage';
import Logger from '@/utils/logger';

import plugins from '~plugins';

const activePlugins: IPlugin[] = [];
const logger = Logger.new('plugins');
export const pluginPatches: { owner: string; patches: PlaintextPatches[]; }[] = [];

void (async () => {
    for(const pluginName in plugins) {
        const plugin = plugins[pluginName] as IPlugin;
        const pluginStatus = await status(plugin.name);

        if(pluginStatus === PluginStatus.ENABLED || plugin.isRequired) {
            logger.log(`prepared ${ plugin.name }'s plaintext patches (if existing)`);
            activePlugins.push(plugin);

            if(plugin.patches) {
                pluginPatches.push({
                    owner: plugin.name,
                    patches: plugin.patches
                });
            }
        }
    }

    await waitForWebpack.then(() => {
        logger.log('finished waiting for webpack');

        for(const activePlugin of activePlugins) {
            logger.log(`starting ${ activePlugin.name } v${ activePlugin.version }`);

            try {
                activePlugin.start?.();
            } catch(err) {
                assertType<Error>(err);
                logger.error(`${ activePlugin.name } crashed! Error:`, (err?.stack ?? err?.message ?? err));
                set(`${ activePlugin.name }.status`, PluginStatus.CRASHED);
            }
        }
    });
})();