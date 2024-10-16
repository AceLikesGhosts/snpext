import definePlugin from '@/utils/plugin';

export default definePlugin({
    name: 'RemoveBlockers',
    version: '1.0.0',
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
        }
    ]
});