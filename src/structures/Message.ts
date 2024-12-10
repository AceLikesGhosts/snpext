import { waitForLazy } from '@/webpack/searching';
import type { Id } from './Id';
import { Filters } from '@/webpack/Filters';

export type MessageDescriptor = {
    conversationId: Id;
    messageId: bigint;
};

export type Reaction = {
    reactionContent: {
        emoji: unknown;
        intentionType: 4n;
    };
    reactionId: bigint;
};

export type MetadataReaction = {
    reaction: Reaction;
    userId: Id;
};

export type MessageMetadata = {
    seenBy: Id[];
    savedBy: Id[];
    openedBy: Id[];
    mentionedUserIds: Id[];
    screenShottedBy: Id[];
    screenRecordedBy: Id[];
    reactions: Reaction[];

    tombstone: boolean;
    createdAt: string;
    readAt: bigint;

    isSaveable: boolean;
    isFriendLinkPending: boolean;
    isReactable: boolean;
    isErasable: boolean;
    isEdited: boolean;
    isEditable: boolean;

    replayedByUsers: Id[];
    savePolicy: number;
};

// snap = 9?

export enum RemoteMediaType {
    PICTURE = 2,
    VIDEO = 3,
    AUDIO = 5,
    IMAGE = 0,
    GIF = 2,
    UNKNOWN = 4,
    UNRECOGINIZED = -1,
    SNAP_VIDEO = 9
}

type ContentTypeInternalMapping = {
    CHAT: number;
    CREATIVE_TOOL_ITEM: number;
    EXTERNAL_MEDIA: number;
    FAMILY_CENTER_ACCEPT: number;
    FAMILY_CENTER_INVITE: number;
    FAMILY_CENTER_LEAVE: number;
    LIVE_LOCATION_SHARE: number;
    LOCATION: number;
    MAP_REACTION: number;
    MY_AI_SPECTACLES_BOT_RESPONSE: number;
    NOTE: number;
    PROMPT_LENS_RESPONSE: number;
    SHARE: number;
    SNAP: number;
    STATUS: number;
    STATUS_CALL_MISSED_AUDIO: number;
    STATUS_CALL_MISSED_VIDEO: number;
    STATUS_CONVERSATION_CAPTURE_RECORD: number;
    STATUS_CONVERSATION_CAPTURE_SCREENSHOT: number;
    STATUS_COUNTDOWN: number;
    STATUS_PLUS_GIFT: number;
    STATUS_SAVE_TO_CAMERA_ROLL: number;
    STATUS_SNAP_REMIX_CAPTURE: number;
    STICKER: number;
    TINY_SNAP: number;
    UNKNOWN: number;
};

export let ContentType: ContentTypeInternalMapping & { [K: number]: string; } | null = null;
waitForLazy<ContentTypeInternalMapping>(
    Filters?.byKeys('UNKNOWN', 'CHAT', 'NOTE', 'SNAP'),
    (output) => {
        ContentType = output;
    }
);

type MessageStateInternalMapping = {
    PREPARING: number;
    SENDING: number;
    COMMITTED: number;
    FAILED: number;
    CANCELING: number;
    PENDING_DECRYPTION: number;
};

export let MessageState: MessageStateInternalMapping & { [K: number]: string; } | null = null;
waitForLazy<MessageStateInternalMapping>(
    Filters?.byKeys('PREPARING', 'SENDING', 'PENDING_DECRYPTION'),
    (output) => {
        MessageState = output;
    }
);

export type MediaReference = {
    contentObject: Uint8Array;
    mediaListId: bigint;
    mediaReferenceKey: string;
    mediaType: RemoteMediaType;
    metadataType: unknown;
    videoDescription: unknown;
};

export type MessageContent = {
    content: Uint8Array;
    contentType: ContentTypeInternalMapping;
    localMediaReferences: unknown;
    messageTypeMetadata: unknown;
    quotedMessage: unknown;
    remoteMediaInfo: unknown;
    remoteMediaReferences: { mediaReferences: MediaReference[]; }[];
    snapDisplayInfo: unknown;
    thumbnailIndexLists: { indicies: number[]; }[];
};

export type Message = {
    senderId: Id;
    descriptor: MessageDescriptor;
    metadata: MessageMetadata;
    messageContent: MessageContent;
    eelStatus: unknown;
    orderKey: bigint;
    state: MessageStateInternalMapping;
    releasePolicy: number;
};