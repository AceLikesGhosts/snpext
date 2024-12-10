import type { Authors } from '@/utils/authors';
import type { PlaintextPatches } from '@/webpack/types';

export type IPlugin = {
    name: string;
    version: string;
    description?: string;
    authors?: Authors[] 

    /**
     * If the plugin is required for
     * the mod to work (i.e. _core/ plugins)
     */
    isRequired?: boolean;

    start?: () => void;
    stop?: () => void;
    patches?: PlaintextPatches[];
};

export enum PluginStatus {
    ENABLED = 0,
    DISABLED = 1,
    CRASHED = 2,
}
