import type { Plugin } from 'esbuild';
import { stat } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join, relative } from 'path';
import { injectedEntryPoint } from './build';

export default {
    name: 'gen-plugins',
    setup(build) {
        const filter = /^~plugins/;
        const pluginDir = join(injectedEntryPoint, '..', 'plugins');

        build.onResolve({ filter }, args => ({
            path: args.path,
            namespace: 'gen-plugins'
        }));

        build.onLoad({ filter, namespace: 'gen-plugins' }, async () => {
            const plugins: string[] = [];
            const exports: string[] = [];

            let i: number = 0;
            async function getPlugins(path: string) {
                const files = await readdir(path);

                for(const fileName of files) {

                    const filePath = join(path, fileName);
                    const fileStat = await stat(filePath);

                    if(fileStat.isDirectory() && (fileName.includes('_core') || fileName.includes('api'))) continue;

                    const mod = `p${ i }`;
                    plugins.push(`import ${ mod } from './${ relative(pluginDir, filePath).replace(/\.tsx?$/, '').replaceAll('\\', '/') }';`);
                    exports.push(`[${ mod }.name]:${ mod },\n`);

                    i++;
                }
            }

            await getPlugins(pluginDir);
            await getPlugins(join(pluginDir, '_core'));

            return {
                contents: `${ plugins.join('\n') }\nexport default {${ exports.join('\n') }}`,
                loader: 'ts',
                resolveDir: pluginDir,
                watchDirs: [pluginDir]
            };
        });
    },
} as Plugin;