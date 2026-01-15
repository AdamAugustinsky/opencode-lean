export interface Part {
    type: string;
    id?: string;
    text?: string;
    synthetic?: boolean;
}
export interface Message {
    id: string;
    role: string;
}
export interface MessageWithParts {
    info: Message;
    parts: Part[];
}
export declare function createEmptyMessageSanitizerHook(): {
    "experimental.chat.messages.transform": (_input: Record<string, never>, output: {
        messages: MessageWithParts[];
    }) => Promise<void>;
};
