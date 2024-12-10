import { RemoteMediaType, type Message } from '@/structures/Message';
import Logger from '@/utils/logger';
import definePlugin from '@/utils/plugin';
import { getByKeys } from '@/webpack';
import { React } from '@/webpack/common';

const logger = Logger.new('plugin', 'SaveImages');

const SVGStyle = {
    height: '20px',
    width: '20px',
};

function determineExtension(message: Message) {
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
        case RemoteMediaType.VIDEO: case RemoteMediaType.SNAP_VIDEO: {
            extension = 'mp4';
            break;
        }
        case RemoteMediaType.AUDIO: {
            extension = 'mp3';
            break;
        }
        default: {
            logger.error('wrong type provided, noop', message);
            return;
        }
    }

    return extension;
}

function DownloadButton() {
    return React.createElement(
        'svg',
        {
            stroke: 'currentColor',
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
    );
}

function downloadContent(
    src: string,
    name: string
) {
    const link = document.createElement('a');
    link.style.display = 'hidden';
    link.href = src;

    link.download = name;
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

export default definePlugin({
    name: 'SaveImages',
    description: 'Allows for downloading images which are in the chat.',
    version: '1.0.0',
    chatSaveComponent: ({ original, setHoveredActionLabel, message }: {
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
                if(!imageOrVideoElement) {
                    logger.error('failed to find image from id, regex patches probably died');
                    return;
                }

                const extension = determineExtension(message);
                if(!extension) {
                    return;
                }

                downloadContent(
                    imageOrVideoElement!.src,
                    `Snapchat-${ message.descriptor.messageId }.${ extension }`
                );
            },
        },
            DownloadButton()
        );
    },
    snapSaveComponent: ({ message }: { message: Message; }) => {
        const attachment = document.querySelector<HTMLImageElement>('img[draggable="false"][loading="lazy"]:not([id])') ||
            document.querySelector<HTMLIFrameElement>(
                'video[autoplay][controlslist="nodownload"][disablepictureinpicture][disableremoteplayback][loop][src*="blob:"]'
            );

        let notAllowed: boolean = false;

        if(!attachment) {
            logger.verbose('SaveImages~Failed to find attachment based off poor querySelector! Told you this would happen.');
            notAllowed = true;
        }

        const extension = determineExtension(message);
        if(!extension) {
            notAllowed = true;
        }

        // this is missing the on hover effect,
        // i cant be bothered to write CSS rn
        // TODO: come back when inserting css is a util!

        return React.createElement('button', {
            disabled: notAllowed,
            style: {
                background: '#2b2b2b',
                border: 'none',
                height: '36px',
                minHeight: '36px',
                borderRadius: '50%',
            },
            "aria-disabled": notAllowed,
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();

                if(notAllowed) {
                    return;
                }

                downloadContent(
                    attachment!.src,
                    `Snapchat-${ message.descriptor.messageId }.${ extension }`
                );
            }
        }, [
            DownloadButton()
        ]);
    },
    patches: [

        // saving snaps:
        {
            find: /saving_snap_from_lightbox_attempt/,
            replacements: [
                {
                    find: /defaultMessage:\[{type:0,value:"Error: Unable to save Snap".*:void 0;[^,]*,[^,]*,{messageForReaction:(.)}[^\}]*}([^\}]*}).*..\.saveIcon[^\}]*}[^\}]*}[^\}]*}[^\)]*\)[^\)]*\)[^\)]*\)/,
                    replace: `$0,$self.snapSaveComponent({ message: $1 }) /* reaction button 1 */`
                }
            ]
        },


        {
            find: /am-reactions-button/,
            replacements: [
                {
                    find: /message:(.),showingReactionPicker:.,setShowingReactionPicker:.,setHoveredActionLabel:(.)(.*)\.REACTIONS\)&&([^\(]*)([^\)]*\))\(([^,]*)(.*)"am-save"([^\,]*,)/,
                    replace: `$0$4($self.chatSaveComponent({ original: $6, setHoveredActionLabel: $2, message: $1 })),/* reactions button 2 */`
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
                    replace: '$0messageId:$1, /* le to media layer 1 */'
                },

                // passing from `E` to `l` which wraps `le`
                {
                    find: /\({snapdoc:..*openLightbox:./,
                    replace: '$0,messageId /* le to media layer 2 */'
                },
                {
                    find: /\({snapdoc:..*openLightbox:..*mediaInfos:.,/,
                    replace: '$0messageId, /* le to media layer 3 */'
                },
            ]
        },
        {
            // passing from `l` to `le`,
            find: /function ..*\({snapdoc:.,metricsType:.,/,
            replacements: [
                {
                    find: /function ..*\({snapdoc:.,metricsType:.,/,
                    replace: '$0messageId, /* l to le 1 */'
                },
                {
                    find: /return\(0,([^\)]*\))\(([^,]*,){mediaInfos:.,metricsType:.,/,
                    replace: '$0messageId, /* l to le 2 */'
                },
            ]
        },
        {
            // passing from `le` to `MediaLayer`
            find: /\({progressBarConfig:.,mediaInfos:.,/,
            replacements: [
                {
                    find: /\({progressBarConfig:.,mediaInfos:.,/,
                    replace: '$0messageId, /* le to media layer 1 */'
                },
                {
                    find: /jsx\)\(.,{metricsType:.,layer:.,/,
                    replace: '$0messageId, /* media layer 2 */'
                }
            ]
        },
        {
            // MediaLayer to VideoPlayer or ImagePlayer
            find: /\({layer:.,autoplay:t,fullscreen:.,paused:.,/,
            replacements: [
                {
                    find: /\({layer:.,autoplay:.,fullscreen:.,paused:.,/,
                    replace: '$0messageId, /* layer 1 */'
                },
                {
                    // messageId to ImageLayer
                    find: /ImageLayer:return\(([^\)]*\))\(.,{ref:.,/,
                    replace: '$0messageId, /* mid to image layer */'
                },
                {
                    // messageId to VideoLayer
                    find: /VideoLayer:return\(([^\)]*\))\(.,{ref:.,/,
                    replace: '$0messageId, /* mid to videolayer */'
                },

                {
                    // accepting in ImageLayer 
                    find: /\(\{onLoad:.,playbackConfig:.,/,
                    replace: '$0messageId, /* image layer 1 */'
                },
                {
                    find: /\.jsx\)\("img",{ref:.,/,
                    replace: '$0id:messageId, /* image layer 2 */'
                },

                {
                    // accepting in VideoLayer
                    find: /\({className:.,fullscreen:.,autoplay:.,/,
                    replace: '$0messageId, /* video layer 1 */'
                },
                {
                    find: /\.jsx\)\("video",{ref:.([^,]*,)([^,]*,)/,
                    replace: '$0id:messageId, /* video layer 2 */'
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
                    replace: '$0messageId:$1, /* note 1 */'
                },
                {
                    find: /(function ..\({note:.,remoteMediaReferences:.)(.*"Invalid audio note.*\("audio",{controls:([^,]*,))/,
                    replace: '$1,messageId$2id:messageId, /* note 2 */'
                }
            ]
        }
    ]
});
