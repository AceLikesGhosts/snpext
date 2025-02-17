import { Authors } from '@/utils/authors';
import definePlugin from '@/utils/plugin';

export default definePlugin({
    name: 'RemoveBanner',
    version: '1.0.0',
    description: 'Removes the banner above the chat for specific cases (notifications, pwa install, banner)',
    authors: [Authors.ACE],
    patches: [
        {
            find: /shouldShowBanner:./,
            replacements: [
                {
                    find: /(switch\(.\){case ..\.Banner:)(([^;]*\;))/,
                    replace: '$1return null;'
                },
                {
                    find: /(case ..\.PwaInstall:)(([^;]*\;))/,
                    replace: '$1return null;'
                },
                {
                    find: /(case ..\.Notifications:)(([^;]*\;))/,
                    replace: '$1return null;'
                },
            ]
        }
    ]
});