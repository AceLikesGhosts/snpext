import type { Plugin } from 'esbuild';
import path from 'path';
import { mkdir } from 'fs/promises';
import { createIfNotEqual } from './manifest';
import { readFile } from 'fs/promises';

export default {
    name: 'settings-html',
    setup(build) {
        const entryPoint = (build!.initialOptions.entryPoints as string[])[0] as string;
        const settingsFolder = path.join(entryPoint, '..');
        const settingHTML = path.join(settingsFolder, 'settings.html');

        build.onStart(async () => {
            try {
                await mkdir(path.join(__dirname, '..', 'dist'));
            } catch(err) {
                // don't care
            }
            
            const content = await readFile(
                settingHTML,
                { encoding: 'utf-8' }
            );

            await createIfNotEqual(
                'settings.html',
                content
            );
        });

        build.onLoad({ filter: /.*/ }, () => {
            return {
                watchFiles: [settingHTML]
            };
        });
    },
} as Plugin;