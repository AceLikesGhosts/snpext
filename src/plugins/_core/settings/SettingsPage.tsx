import { type IPlugin, PluginStatus, status, toggle } from '@/plugins/api';
import { SETTINGS_STORE } from '@/utils/settingsStore';
import plugins from '~plugins';
import { logger } from './index';
import { React } from '@/webpack/common/React';
import { CustomCSS } from './CustomCSS';

export const SETTINGS_PAGE_CSS = `
.settings-full-width {
    width: 100%
    margin-left: 10px;
    margin-right: 10px;
}
    
.settings-flex {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    // border-left: solid #2e2d2d 2px;
}

.settings-item {
    width: 450px;
}

.settings-flex-no-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.settings-flex-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
}

.settings-text-colour {
    color: var(--sigTextPrimary);
}

@media (prefers-color-scheme: dark) {
  .settings-text-colour {
    color: var(--sigTextInverse);
  }
}

.settings-text-secondary-colour {
    color: var(--sigTextSecondary);
}
`;

function sortPlugins(plugins: Record<string, IPlugin>) {
    const requiredPlugins: [string, IPlugin][] = [];
    const nonRequiredPlugins: [string, IPlugin][] = [];

    Object.entries(plugins).forEach(([key, plugin]) => {
        if(plugin.isRequired) {
            requiredPlugins.push([key, plugin]);
        } else {
            nonRequiredPlugins.push([key, plugin]);
        }
    });

    const sortedRequiredPlugins = Object.fromEntries(
        requiredPlugins.sort(([, plugin1], [, plugin2]) => {
            return plugin1.name.localeCompare(plugin2.name);
        })
    );

    const sortedNonRequiredPlugins = Object.fromEntries(
        nonRequiredPlugins.sort(([, plugin1], [, plugin2]) => {
            return plugin1.name.localeCompare(plugin2.name);
        })
    );

    return {
        requiredPlugins: sortedRequiredPlugins,
        nonRequiredPlugins: sortedNonRequiredPlugins,
    };
}

export function SettingsPage() {
    const {
        nonRequiredPlugins: sortedNonRequiredPlugins,
        requiredPlugins: sortedRequiredPlugins
    } = sortPlugins(plugins);

    // const [requiresReload, setRequiresReload] = React.useState<boolean>(false);
    const [reloadReasons, setReloadReasons] = React.useState<
        {
            pluginName: string;
            currentStatus: PluginStatus;
        }[]
    >([]);

    function appendReloadReason({
        pluginName,
        currentStatus
    }: { pluginName: string; currentStatus: PluginStatus; }) {
        setReloadReasons((reasons) => {
            const newReasons = reasons.map(reason => {
                if(reason.pluginName === pluginName) {
                    return { pluginName, currentStatus };
                }

                return reason;
            });

            if(newReasons.find(reason => reason.pluginName === pluginName)) {
                return newReasons;
            }

            return [...newReasons, { pluginName, currentStatus }];
        });
    }

    return (
        <div className="settings-flex settings-full-width">
            <div>
                <span>
                    <a href='#settings' onClick={((e) => { location.hash = '#settings'; location.reload(); })}>
                        {reloadReasons.length > 0 && 'Reload to '}
                        {reloadReasons.map(({ pluginName, currentStatus }) => {
                            const statusString = currentStatus === PluginStatus.ENABLED ? 'enable' : currentStatus === PluginStatus.DISABLED ? 'disable' : 'crashed?';
                            return `${ statusString } ${ pluginName }`;
                        }).join(', ')}
                    </a>
                </span>
            </div>

            <div className='settings-flex-no-center'>
                <h1>Plugins</h1>

                <ul style={{ listStyle: 'none' }}>
                    {Object.values(sortedNonRequiredPlugins).map((plugin) => <li className='settings-item'>
                        <PluginCard plugin={plugin} appendReloadReason={appendReloadReason} />
                    </li>)}
                </ul>
            </div>

            <div className='settings-flex-no-center'>
                <h2>Required Plugins</h2>

                <ul style={{ listStyle: 'none' }}>
                    {Object.values(sortedRequiredPlugins).map((plugin) => <li className='settings-item'>
                        <PluginCard plugin={plugin} appendReloadReason={appendReloadReason} />
                    </li>)}
                </ul>
            </div>

            <CustomCSS />
        </div>
    );
}

function PluginCard({
    plugin,
    appendReloadReason
}: { plugin: IPlugin; appendReloadReason: ({ currentStatus, pluginName }: { currentStatus: PluginStatus; pluginName: string; }) => unknown; }) {
    const [pluginStatus, setPluginStatus] = React.useState<PluginStatus | null>(null);
    const hasSettings = !!SETTINGS_STORE.store[plugin.name];

    React.useEffect(() => {
        async function getStatus() {
            const currentPluginStatus = await status(plugin.name);
            logger.verbose('fetched status', currentPluginStatus);
            setPluginStatus(currentPluginStatus);
            logger.verbose('set status', currentPluginStatus);
        }

        if(pluginStatus === null) {
            logger.log('plugin status doesnt exist');
            getStatus();
        }
    }, []);

    return (
        <div className='settings-text-colour'>
            <div className='settings-flex-row' style={{ height: '70px' }}>
                <h1>{plugin.name}</h1>
                <span className='settings-text-secondary-colour' style={{ marginLeft: '4px', marginRight: '4px' }}>(v{plugin.version})</span>
                <input
                    type="checkbox"
                    name={`${ plugin.name } Toggle`}
                    checked={pluginStatus === PluginStatus.ENABLED}
                    disabled={plugin.isRequired || pluginStatus === PluginStatus.CRASHED || pluginStatus === null}
                    onClick={(async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if(plugin.isRequired) {
                            return;
                        }

                        const newStatus = await toggle(plugin.name);
                        setPluginStatus(newStatus);

                        if(newStatus === PluginStatus.CRASHED) {
                            logger.error('Plugin crashed upon settings page start', plugin.name, newStatus);
                        }

                        appendReloadReason({
                            pluginName: plugin.name,
                            currentStatus: newStatus!
                        });
                    })}
                />
            </div>

            <div className='settings-flex-row'>
                <div>
                    {plugin.authors && plugin.authors.length > 0
                        // && <span>by {plugin.authors?.map((authors) => authors).join(', ')}</span>
                        && <span>by {plugin.authors.map((author) => <a href={author.githubUrl} target='_blank'>{author.shortName}</a>)}</span>
                    }
                </div>
            </div>

            <div>
                {plugin.description}
            </div>

            {hasSettings &&
                <details>
                    <summary>Open plugin settings</summary>
                </details>
            }
        </div>
    );
}