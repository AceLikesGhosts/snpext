import CSSManager from '@/utils/css';
import Logger from '@/utils/logger';
import { Patcher } from '@/utils/patcher/patcher';
import definePlugin from '@/utils/plugin';
import { getByStrings } from '@/webpack';
import { React } from '@/webpack/common/React';
import { SETTINGS_PAGE_CSS, SettingsPage } from './SettingsPage';
import { get } from '@/utils/storage';

let SettingsContext: React.Context<{
    settingsShown: boolean;
    setSettingsShown: (..._: any[]) => any;
}>;

let SettingsProvider: ({ children }: { children: React.ReactNode; }) => React.ReactNode;

export const logger = Logger.new('settings');
const patcher = Patcher.new('settings');
export const css = CSSManager.new('settings');
export let customCssIndex: number;

export default definePlugin({
    name: 'Settings',
    version: '1.0.0',
    isRequired: true,
    settingsButton: ({ original }: { original: React.FunctionComponent; }) => {
        if(!SettingsContext) {
            logger.log('settingsButton no SettingsContext');
            return snpext.webpack.common.React.createElement(original, {}, []);
        }

        const settingsContext = React.useContext(SettingsContext);
        logger.verbose('settingsContext~settingsButton', settingsContext.settingsShown);

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {original && snpext.webpack.common.React.createElement(original, {}, [])}
                <div style={{
                    display: 'flex',
                }}
                    onClick={(() => {
                        settingsContext.setSettingsShown(!settingsContext.settingsShown);
                        logger.verbose('on click called', settingsContext.settingsShown);
                    })}
                >
                    <button
                        type='button'
                        style={{
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            stroke-width="0"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"

                            height={'18px'}
                            width={'18px'}

                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <path
                                d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
        );
    },

    intermediateSettingsComponent: ({ original, args }: { original: React.FunctionComponent; args: Record<PropertyKey, unknown> | undefined, }) => {
        logger.verbose('intermediateSettingsComponent called');

        if(!SettingsContext) {
            logger.log('intermediateSettingsComponent failed to find settings context');
            return snpext.webpack.common.React.createElement(original, args ?? {}, []);
        }

        const {
            settingsShown,
            setSettingsShown
        } = React.useContext(SettingsContext);

        if(!settingsShown) {
            return snpext.webpack.common.React.createElement(original, args ?? {}, []);
        }

        return (
            <SettingsPage />
        );
    },

    start: () => {
        const [key, obj] = getByStrings<Record<string, () => React.ReactNode>>('path:"coming-soon"', { withKey: true });
        if(!key || !obj) {
            throw 'missing key or obj of frontend module (settings.tsx)';
        }

        css.insert(SETTINGS_PAGE_CSS);

        customCssIndex = css.insert('/* stub for customcss */');
        void (async function loadCustomCSSFromIDB() {
            const currentCSS = await get<string>('customcss');
            currentCSS && css.update(customCssIndex, currentCSS);
        })();

        logger.log('Patching to add settings');
        SettingsContext = React.createContext({
            settingsShown: false as boolean,
            setSettingsShown: () => void 0
        });

        SettingsProvider = ({ children }) => {
            const [settingsShown, setSettingsShown] = React.useState(
                location.hash === '#settings'
            );

            return (
                <SettingsContext.Provider value={{ setSettingsShown, settingsShown }}>
                    {children}
                </SettingsContext.Provider>
            );
        };

        console.log('patching', obj, key);
        patcher.after(obj, key, (args, result, ctx) => {
            logger.log('patched zne called', args, result, ctx);
            return (
                <SettingsProvider>
                    {result}
                </SettingsProvider>
            );
        });
    },

    stop: () => {
        patcher.unpatchAll();
        css.remove();
    },

    patches: [
        {
            find: /profileAndUpdateButtonContainer/,
            replacements: [
                {
                    // we have to remove their performance increases here
                    // due to the fact we want this component to rerender
                    // sad

                    find: /(profileAndUpdateButtonContainer},void 0,)(([^\(]*\()([^\(]*))([^\)]*\))\(([^,]*),([^\)]*\))(\))/,
                    replace: '$1$self.settingsButton({ original: $6 })'
                }
            ]
        },
        {
            find: /outgoingCallInMain/,
            replacements: [
                {
                    find: /(element:)(.\?void 0:).{0,3}(\|\|\(.{0,3}=)([^\)]*\)\()([^,]*)(,[^\)]*\)\))/g,
                    replace: '$1$2$self.intermediateSettingsComponent({ original: $5 })',
                }
            ]
        },
        {
            find: /plazaContentContainer/,
            replacements: [
                {
                    /* 
                    1 is vne||(vne=(0,i.A) 
                    2 is (h.qh 
                    3 is ,{path:"*",element: 
                    4 is (0,i.A)( 
                    5 is h.C5,{to:"/",replace:!0} 
                    6 is , 
                    7 is )}))))) 
                    8 is $8 */

                    find: /(.{0,3}\|\|\(.{0,3}=[^\)]*\))([^,]*)(,{path:"\*",element:)([^\)]*\)\()([^,]*)(,)({to:"\/",replace:!0})([^,]*)/,
                    replace: '$1$2$3$self.intermediateSettingsComponent({ original: $5, args: $7 }$8'
                }
            ]
        }
    ]
});