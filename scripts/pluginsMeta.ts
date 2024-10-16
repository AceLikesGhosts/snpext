import type { Plugin } from 'esbuild';
import { stat } from 'fs/promises';
import { readdir } from 'fs/promises';
import { join, relative } from 'path';
import { injectedEntryPoint } from './build';
import ts from 'typescript';
import { readFile } from 'fs/promises';

async function getPluginMetadata(filePath: string): Promise<Record<string, string | boolean> | null> {
    const code = await readFile(filePath, 'utf-8');

    // Parse the source file into an AST
    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.ESNext, true);

    let metadata: Record<string, string | boolean> | null = null;

    // Traverse the AST and find the export default statement
    function visit(node: ts.Node) {
        // Check if this is an 'export default'
        if(ts.isExportAssignment(node)) {
            const exportedExpr = node.expression;

            // Check if the export is a call expression (e.g., definePlugin({...}))
            if(ts.isCallExpression(exportedExpr)) {
                const callArguments = exportedExpr.arguments;

                // Check if the first argument is an object literal (i.e., the metadata)
                if(callArguments.length > 0 && ts.isObjectLiteralExpression(callArguments[0])) {
                    const objectLiteral = callArguments[0];
                    metadata = {};

                    // Iterate over the object properties
                    objectLiteral.properties.forEach(prop => {
                        if(ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                            const key = prop.name.text;

                            // Extract the value from the initializer
                            const valueNode = prop.initializer;
                            if(ts.isStringLiteral(valueNode)) {
                                metadata![key] = valueNode.text;
                            } else if(ts.isNumericLiteral(valueNode)) {
                                metadata![key] = valueNode.text;
                            } else if(ts.isIdentifier(valueNode)) {
                                metadata![key] = valueNode.text;
                            } else {
                                metadata![key] = true;
                            }
                        }
                    });
                }
            }
        }

        // Continue traversing the tree
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if(!metadata) {
        console.warn(`No metadata found in ${ filePath }`);
    }

    return metadata;
}

export default {
    name: 'gen-plugins-meta',
    setup(build) {
        const filter = /^~plugins-meta/;
        const pluginDir = join(injectedEntryPoint, '..', 'plugins');

        build.onResolve({ filter }, args => ({
            path: args.path,
            namespace: 'gen-plugins-meta'
        }));

        build.onLoad({ filter, namespace: 'gen-plugins-meta' }, async () => {
            const exports: string[] = [];

            async function getPlugins(path: string) {
                const files = await readdir(path);

                for(const fileName of files) {
                    const filePath = join(path, fileName);
                    const fileStat = await stat(filePath);
                    if(fileStat.isDirectory() && (fileName.includes('_core') || fileName.includes('api'))) continue;

                    const metadata = await getPluginMetadata(filePath);
                    exports.push(`[${ JSON.stringify(metadata?.name) }]: ${ JSON.stringify(metadata) },`);
                }
            }

            await getPlugins(pluginDir);
            await getPlugins(join(pluginDir, '_core'));

            return {
                contents: `export default {${ exports.join('\n') }}`,
                loader: 'ts',
                resolveDir: pluginDir,
                watchDirs: [pluginDir]
            };
        });
    },
} as Plugin;