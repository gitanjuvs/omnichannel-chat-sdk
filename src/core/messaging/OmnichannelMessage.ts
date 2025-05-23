import LiveChatVersion from "../LiveChatVersion";

export class MessageContentType {
    static readonly RichText = "RichText";
    static readonly Text = "Text";
}

export class DeliveryMode {
    static readonly Bridged = "bridged";
    static readonly Unbridged = "unbridged";
}

export class MessageType {
    static readonly UserMessage = "UserMessage";
    static readonly SwiftCard = "SwiftCard";
    static readonly Typing = "Control/Typing";
    static readonly ClearTyping = "Control/ClearTyping";
    static readonly LiveState = "Control/LiveState";
}

export enum PersonType {
    Unknown = 0,
    User = 1,
    Bot = 2
}

export enum Role {
    Bot = "bot",
    Agent = "agent",
    System = "system",
    User = "user",
    Unknown = "unknown"
}

export interface IPerson {
    displayName: string;
    id: string;
    type: PersonType;
}

export interface IMessageProperties {
    OriginalMessageId?: string; // Original message id from the source messaging channel before bridging and any retries
    [id: string]: string | undefined;
}

export enum FileSharingProtocolType {
    AmsBasedFileSharing = 0
}

export interface IFileMetadata {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    fileSharingProtocolType?: FileSharingProtocolType;
}

export class ResourceType {
    static readonly NewMessage = "NewMessage";
    static readonly MessageUpdate = "MessageUpdate";
    static readonly UserPresence = "UserPresence";
    static readonly ConversationUpdate = "ConversationUpdate";
    static readonly ThreadUpdate = "ThreadUpdate";
}

interface OmnichannelMessage {
    id: string;
    liveChatVersion: LiveChatVersion;
    clientmessageid?: string;
    messageid?: string;
    content: string;
    contentType: string;
    deliveryMode: DeliveryMode | undefined;
    messageType: MessageType;
    sender: IPerson;
    timestamp: Date;
    properties?: IMessageProperties;
    tags?: string[];
    fileMetadata?: IFileMetadata;
    resourceType?: ResourceType;
    role?: string;
}

export default OmnichannelMessage;