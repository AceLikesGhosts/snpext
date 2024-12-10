import type { PlaintextPatches } from '@/webpack/types';
import { PluginStatus, status, type IPlugin } from '.';
import { waitForWebpack } from '@/webpack';
import { assertType } from '@/utils/assert';
import { set } from '@/utils/storage';
import Logger from '@/utils/logger';

import plugins from '~plugins';
import wait from '@/utils/wait';

const activePlugins: IPlugin[] = [];
const logger = Logger.new('plugins');
export const pluginPatches: { owner: string; patches: PlaintextPatches[]; }[] = [];
export const [waitForPatches, resolvePatches] = wait();

void (async () => {
    // this is a REALLY bad hack
    // that will MURDER performance,,,
    // so ideally plugins will work around this
    // really possible and common case...
    // haha!
    
    // pluginPatches.push({
    //     owner: 'Internal String-Replacement Escaping',
    //     patches: [
    //         {
    //             find: /\$(\d+)/,
    //             replacements: [
    //                 {
    //                     // /\$(\d+)/g, '$$$$$1'
    //                     find: /\$(\d+)/g,
    //                     replace: (substr, ...groups) => {
    //                         console.log(`groups:`, groups);
    //                         return `dollarSign${ groups[0] }`;
    //                     }
    //                 }
    //             ]
    //         }
    //     ]
    // });

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

    resolvePatches();

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