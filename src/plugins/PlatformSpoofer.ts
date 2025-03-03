import definePlugin from '@/utils/plugin';
import makePluginSettings from '@/utils/settingsStore';
import { getByKeys } from '@/webpack';

type Platforms = {
    UNKNOWN_OS_TYPE: 0;
    OS_IOS: 1;
    OS_ANDROID: 2;
    OS_WEB: 3;
};

const platformEnum = getByKeys<Platforms>('OS_ANDROID', 'OS_IOS', 'OS_WEB');

const settings = makePluginSettings({

});

export default definePlugin({
    name: 'PlatformSpoofer',
    description: '',
    version: '1.0.0',
    // patches: [
    //     // {
    //     //     find: /getLogger\("[Messaging Client]"\)/,
    //     //     replacements: [
    //     //         {
    //     //             find: /a/,
    //     //             replace: ''
    //     //         }
    //     //     ]
    //     // }
    //     // {
    //     //     find: /"statusMessage"===.\.content\?\.\$case/,
    //     //     replacements: [
    //     //         {
    //     //             // (e) => e.content?.statusMessage === 'dwebUpsell' 
    //     //             // ? undefined 
    //     //             // : "statusMessage"===e.content?.$case&&v.Mo.encode(e.content.statusMessage,t.uint32(66).fork()).ldelim(),
    //     //             find: /(encode:\(.,.=.\.Writer\.create\(\)\)=>\("text)(.*)("statusMessage")(===)(.)(\.content\?\.\$case)/,
    //     //             // $5 = e
    //     //             replace: '$1$2$3$4$5$6&&$5.content.statusMessage==="dwebUpsell"?void 0:'
    //     //         }
    //     //     ]
    //     // }
    // ]
});


/**
 * snpext.webpack.getByKeys('NONE', 'WEB', 'MOBILE')
 * 
 presentOnPlatform: o
 useLaptop: o === Hn.OD.WEB


 */