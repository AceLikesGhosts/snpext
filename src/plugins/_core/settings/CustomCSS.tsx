import { debounce } from '@/utils/debounce';
import { get } from '@/utils/storage';
import { React } from '@/webpack/common/React';
import { css, customCssIndex } from '.';

export function CustomCSS() {
    const [customCSS, setCustomCSS] = React.useState<string | null | undefined>(null);
    const debouncedUpdateCSS = debounce(
        (value: string) => {
            css.update(customCssIndex, value);
        },
        500
    );
    React.useEffect(() => {
        async function getCustomCSS() {
            const currentCSS = await get<string>('customcss');
            setCustomCSS(currentCSS);
        }

        if(customCSS === null) {
            void getCustomCSS();
        }
    }, []);

    const customCSSLoading = customCSS === null;
    return (
        <div className="settings-flex-no-center">
            <h3>Custom CSS</h3>

            <textarea
                {...customCSSLoading
                    ? { disabled: true, value: 'Loading custom css...' }
                    : { value: customCSS === undefined ? '' : customCSS }
                }

                onChange={((e) => {
                    setCustomCSS(e.target.value);
                    debouncedUpdateCSS(e.target.value);
                })}
            >
            </textarea>
        </div>
    );
}