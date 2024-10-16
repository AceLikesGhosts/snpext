import type { IPlugin } from '../plugins/api';

export default function definePlugin(p: IPlugin & Record<PropertyKey, unknown>): IPlugin {
    return p;
}