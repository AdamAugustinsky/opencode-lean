export interface RemoteMcpConfig {
    type: "remote";
    url: string;
    enabled: boolean;
    headers?: Record<string, string>;
}
export declare const websearch: RemoteMcpConfig;
export declare const context7: RemoteMcpConfig;
export declare const grep_app: RemoteMcpConfig;
export type McpName = "websearch" | "context7" | "grep_app";
export declare const builtinMcps: Record<McpName, RemoteMcpConfig>;
export declare function createMcps(disabled?: McpName[]): Record<string, RemoteMcpConfig>;
