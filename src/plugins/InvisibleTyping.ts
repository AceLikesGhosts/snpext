import definePlugin from '@/utils/plugin';

export default definePlugin({
    name: 'InvisibleTyping',
    description: 'Prevents typing notifications from being sent when typing.',
    version: '1.0.0',
    patches: [
        {
            find: /getConversationManager\(\).sendTypingNotification/,
            replacements: [
                {
                    find: /{(.{0,2}\.getConversationManager\(\).sendTypingNotification)/,
                    replace: '{void 0;'
                }
            ]
        }
    ]
});