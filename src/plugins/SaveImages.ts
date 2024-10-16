import { RemoteMediaType, type Message } from '@/structures/Message';
import Logger from '@/utils/logger';
import definePlugin from '@/utils/plugin';
import { React } from '@/webpack/common';

const logger = Logger.new('plugin', 'SaveImages');

const SVGStyle = {
    height: '20px',
    width: '20px',
};

export default definePlugin({
    name: 'SaveImages',
    description: 'Allows for downloading images which are in the chat.',
    version: '1.0.0',
    component: ({ original, setHoveredActionLabel, message }: {
        original: React.FunctionComponent<{
            dataTestId?: string;
            labelText: string;
            setHoveredActionLabel: () => unknown;
            onClick: () => void;
        }>;
        setHoveredActionLabel: () => unknown;
        message: Message;
    }) => {
        const messageId = message?.descriptor?.messageId;
        const imageOrVideoElement = document.getElementById(String(messageId)) as HTMLVideoElement | HTMLImageElement | null;

        if(!imageOrVideoElement) {
            logger.verbose('no image or video element, not rendering download');
            return;
        }

        return React.createElement(original, {
            dataTestId: 'hii snapchat team',
            labelText: 'download',
            setHoveredActionLabel,

            onClick: () => {
                console.log(message);

                if(!imageOrVideoElement) {
                    logger.error('failed to find image from id, regex patches probably died');
                    return;
                }

                const link = document.createElement('a');
                link.style.display = 'hidden';
                link.href = imageOrVideoElement!.src;

                let extension: 'png' | 'mp4' | 'mp3';
                if(!message.messageContent.remoteMediaReferences[0].mediaReferences[0].mediaType) {
                    logger.error('failed to locate remote media type');
                    return;
                }

                switch(message.messageContent.remoteMediaReferences[0].mediaReferences[0].mediaType) {
                    case RemoteMediaType.PICTURE: {
                        extension = 'png';
                        break;
                    }
                    case RemoteMediaType.VIDEO: {
                        extension = 'mp4';
                        break;
                    }
                    case RemoteMediaType.AUDIO: {
                        extension = 'mp3';
                        break;
                    }
                    default: {
                        logger.error('wrong type provided, noop');
                        return;
                    }
                }

                link.download = `Snapchat-${ messageId }.${ extension }`;
                document.body.appendChild(link);

                link.click();
                document.body.removeChild(link);
            },
        },
            React.createElement(
                'svg',
                {
                    stroke: "currentColor",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    xmlns: "http://www.w3.org/2000/svg",
                    ...SVGStyle,
                    style: SVGStyle
                },
                React.createElement(
                    'path',
                    {
                        d: 'M3 19H21V21H3V19ZM13 9H20L12 17L4 9H11V1H13V9Z'
                    },
                    void 0
                )
            )
        );
    },
    patches: [
        {
            find: /am-reactions-button/,
            replacements: [
                {
                    find: /message:(.),showingReactionPicker:.,setShowingReactionPicker:.,setHoveredActionLabel:(.)(.*)\.REACTIONS\)&&([^\(]*)([^\)]*\))\(([^,]*)(.*)"am-save"([^\,]*,)/,
                    replace: `$0$4($self.component({ original: $6, setHoveredActionLabel: $2, message: $1 })),`
                }
            ],
        },
        // pass along message to `le` which renders `MediaLayer` which we then pass to
        // ImageLayer and VideoLayer to provide an ID to each element to allow us to
        // select it and not have to regex patch every function they use to handle
        // decrypting and displaying the image...

        {
            find: /\({conversationId:.,messageId:(.),media:..*{snapdoc:.,/,
            replacements: [
                {
                    find: /\({conversationId:.,messageId:(.),media:..*{snapdoc:.,/,
                    replace: '$0messageId:$1,'
                },

                // passing from `E` to `l` which wraps `le`
                {
                    find: /\({snapdoc:..*openLightbox:./,
                    replace: '$0,messageId'
                },
                {
                    find: /\({snapdoc:..*openLightbox:..*mediaInfos:.,/,
                    replace: '$0messageId,'
                },
            ]
        },
        {
            // passing from `l` to `le`,
            find: /function ..*\({snapdoc:.,metricsType:.,/,
            replacements: [
                {
                    find: /function ..*\({snapdoc:.,metricsType:.,/,
                    replace: '$0messageId,'
                },
                {
                    find: /return\(0,([^\)]*\))\(([^,]*,){mediaInfos:.,metricsType:.,/,
                    replace: '$0messageId,'
                },
            ]
        },
        {
            // passing from `le` to `MediaLayer`
            find: /\({progressBarConfig:.,mediaInfos:.,/,
            replacements: [
                {
                    find: /\({progressBarConfig:.,mediaInfos:.,/,
                    replace: '$0messageId,'
                },
                {
                    find: /jsx\)\(.,{metricsType:.,layer:.,/,
                    replace: '$0messageId,'
                }
            ]
        },
        {
            // MediaLayer to VideoPlayer or ImagePlayer
            find: /\({layer:.,autoplay:t,fullscreen:.,paused:.,/,
            replacements: [
                {
                    find: /\({layer:.,autoplay:.,fullscreen:.,paused:.,/,
                    replace: '$0messageId,'
                },
                {
                    // messageId to ImageLayer
                    find: /ImageLayer:return\(([^\)]*\))\(.,{ref:.,/,
                    replace: '$0messageId,'
                },
                {
                    // messageId to VideoLayer
                    find: /VideoLayer:return\(([^\)]*\))\(.,{ref:.,/,
                    replace: '$0messageId,'
                },

                {
                    // accepting in ImageLayer 
                    find: /\(\{onLoad:.,playbackConfig:.,/,
                    replace: '$0messageId,'
                },
                {
                    find: /\.jsx\)\("img",{ref:.,/,
                    replace: '$0id:messageId,'
                },

                {
                    // accepting in VideoLayer
                    find: /\({className:.,fullscreen:.,autoplay:.,/,
                    replace: '$0messageId,'
                },
                {
                    find: /\.jsx\)\("video",{ref:.([^,]*,)([^,]*,)/,
                    replace: '$0id:messageId,'
                }
            ]
        },
        {
            // pass from element that figures out what type of element
            // this is (shared story, audio, etc) and pass the message
            // id down to audio
            find: /case"note":return\(0,...\)\(([^,]*,){note:.([^,]*,)/,
            replacements: [
                {
                    find: /function ..\({messageId:(.),messageContent:.,senderId:..*"MessageContentView".*case"note":return\(0,...\)\(([^,]*,){note:.([^,]*,)/,
                    replace: '$0messageId:$1,'
                },
                {
                    find: /(function ..\({note:.,remoteMediaReferences:.)(.*"Invalid audio note.*\("audio",{controls:([^,]*,))/,
                    replace: '$1,messageId$2id:messageId,'
                }
            ]
        }
    ]
});

// $0true&&$2($self.component({ original: $4, setHoveredActionActionLabel: $1 }))
// ($self.component({ original: $54, setHoveredActionActionLabel: $1 })),
// ([^\,]*)

// /setHoveredActionLabel:(.)(.*)\.REACTIONS\)&&([^\(]*)([^\)]*\))\(([^,]*)/