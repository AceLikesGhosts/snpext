import pkg from '@/utils/pkg';

export function allowForSelf(
    pluginName: string,
    replacement: string
) {
    if(replacement.includes('$self')) {
        replacement = replacement.replace(
            '$self',
            `${ pkg.name }.plugins.get(${ JSON.stringify(pluginName) })`
        );
    }

    return replacement;
}