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

export function escapeStringSub(str: string) {
    return str.replace(/\$(\d+)/, (_substr, group) => {
        return `%${ group }`;
    });
}