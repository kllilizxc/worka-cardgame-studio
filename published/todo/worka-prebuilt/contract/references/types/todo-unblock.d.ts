import type { z } from '@realiz3r/worka-runtime';
import type { unblockActionSchema } from './model';
type UnblockAction = z.infer<typeof unblockActionSchema>;
type UnblockHost = {
    requestFromNote(query: string, input: {
        itemId: string;
    }, requestId: string): Promise<{
        sessionId: string;
    }>;
    openSession(sessionId: string): Promise<void>;
};
/** Each proposal owns its pending/sent state, even when the detail stays mounted. */
export declare function TodoUnblockAction({ action, itemId, host }: {
    action: UnblockAction;
    itemId: string;
    host: UnblockHost;
}): import("react").JSX.Element;
export declare function TodoUnblock({ itemId }: {
    itemId: string;
}): import("react").JSX.Element;
export {};
