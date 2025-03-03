import { Authors } from '@/utils/authors';
import definePlugin from '@/utils/plugin';

export default definePlugin({
    name: 'FixConsole',
    authors: [Authors.ACE],
    version: '1.0.0',
    description: 'Prevents Snapchat from overriding console functions.',
    isRequired: true,
    patches: [
        {
            find: /console\.log=\(\)=>{},/,
            replacements: [
                {
                    find: /console\.log=\(\)=>{},/,
                    replace: ''
                },
                {
                    find: /console\.warn=\(\)=>{},/,
                    replace: ''
                },
                {
                    find: /console\.info=\(\)=>{},/,
                    replace: ''
                },
                {
                    find: /console\.debug=\(\)=>{},/,
                    replace: ''
                },
                {
                    find: /console\.error=\(\)=>{},/,
                    replace: ''
                }
            ]
        }
    ]
});