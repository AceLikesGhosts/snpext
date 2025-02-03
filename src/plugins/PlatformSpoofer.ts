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
    patches: [
        // {
        //     find: /getLogger\("[Messaging Client]"\)/,
        //     replacements: [
        //         {
        //             find: /a/,
        //             replace: ''
        //         }
        //     ]
        // }
        {
            find: /"statusMessage"===.\.content\?\.\$case/,
            replacements: [
                {
                    // (e) => e.content?.statusMessage === 'dwebUpsell' 
                    // ? undefined 
                    // : "statusMessage"===e.content?.$case&&v.Mo.encode(e.content.statusMessage,t.uint32(66).fork()).ldelim(),
                    find: /(encode:\(.,.=.\.Writer\.create\(\)\)=>\("text)(.*)("statusMessage")(===)(.)(\.content\?\.\$case)/,
                    // $5 = e
                    replace: '$1$2$3$4$5$6&&$5.content.statusMessage==="dwebUpsell"?void 0:'
                }
            ]
        }
    ]
});

/**
        Ip().getLogger("[AuthStore]");

Gp.b.DESKTOP_WEB

getConversationManager
updateChatNotificationSettings


sendSnap
*/

/**
     function h9() {
        const [e,t] = (0,
        b.P)((e => [e.plaza.selectedFeedFilter, e.plaza.setSelectedFeedFilter]))
          , n = (0,
        b.P)(b_).length
          , r = [{
            type: a_.RN.All,
            name: "All"
        }, {
            type: a_.RN.Online,
            name: "On Web",
            badgeCount: n
        }];
        return (0,
        i.A)("div", {
            className: (0,
            rt.A)(w_.filters)
        }, void 0, r.map((n => (0,
        i.A)(E9, {
            name: n.name,
            badgeCount: n.badgeCount,
            style: n.type === e ? w_.activeItem : w_.filterItem,
            onClick: () => t(n.type)
        }, n.type))))
    }

$case: "statusMessage",


 */