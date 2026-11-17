import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QueryState, useNote } from '@realiz3r/worka-react';
import { ui } from './messages';
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
export function TodoUnblockAction({ action, itemId, host }: {
    action: UnblockAction;
    itemId: string;
    host: UnblockHost;
}) {
    const [pending, setPending] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false);
    return <section className="folio-detail-section" aria-label={ui('解除阻塞')}>
   <p>{action.request}</p>
   <Button variant="secondary" disabled={pending || sent} onClick={async () => {
            if (pending || sent)
                return;
            setPending(true);
            setError('');
            try {
                const result = await host.requestFromNote('unblockRequest', { itemId }, action.requestId);
                setSent(true);
                await host.openSession(result.sessionId);
            }
            catch (cause) {
                setError(cause instanceof Error ? cause.message : String(cause));
            }
            finally {
                setPending(false);
            }
        }}>{pending ? ui('发送中…') : sent ? ui('已发送') : action.label}</Button>
   {sent && <p role="status">{ui('已发送，可在目标对话中查看进展。')}</p>}
   {error && <p role="alert">{error}</p>}
 </section>;
}
export function TodoUnblock({ itemId }: {
    itemId: string;
}) {
    const { host, useQuery } = useNote<typeof import('./actions')>();
    const query = useQuery('unblockRequest', { itemId });
    return <QueryState query={query}>{action => action && <TodoUnblockAction key={action.requestId} action={action} itemId={itemId} host={host}/>}</QueryState>;
}
