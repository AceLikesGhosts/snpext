import { Authors } from '@/utils/authors';
import definePlugin from '@/utils/plugin';

export default definePlugin({
    name: 'RemoveBlockers',
    version: '1.0.0',
    isRequired: true,
    authors: [Authors.ACE],
    patches: [
        {
            find: /.\),{shouldObscureUserContent(.*?)}/,
            replacements: [
                {
                    find: /shouldObscureUserContent:./,
                    replace: 'shouldObscureUserContent:false'
                },
                {
                    find: /shouldRenderPrivacyScreens:../,
                    replace: 'shouldRenderPrivacyScreens:false'
                },
                {
                    find: /,away:./,
                    replace: ',away:false'
                },
                {
                    find: /screenshotDetected:.}/,
                    replace: 'screenshotDetected:false}'
                }
            ]
        },
        {
            find: /disableAwayDetection/,
            replacements: [
                {
                    find: /disableAwayDetection:([^,}]*)/,
                    replace: 'disableAwayDetection:true'
                }
            ]
        },
        {
            find: /disableScreenshotDetection/,
            replacements: [
                {
                    find: /disableScreenshotDetection:([^,}]*)/,
                    replace: 'disableScreenshotDetection:true'
                }
            ]
        },
        {
            find: /.\.presence\.screenshotDetected=./,
            replacements: [
                {
                    find: /(.\.presence\.screenshotDetected)=./,
                    replace: '$1=false'
                }
            ]
        }
    ]
});