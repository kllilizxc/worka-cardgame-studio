import { useNote } from '@realiz3r/worka-react';
import { Button } from '@/components/ui/button';

/** Render internal result links from the full, untruncated conclusion. */
export function ResultLinks({ conclusion }: { conclusion?: string }) {
  const { navigation, host } = useNote<typeof import('./actions')>();
  const links = [...(conclusion ?? '').matchAll(/\[([^\]\n]+)\]\((\/notes\/[^\s)]+|\/~\/session\/[^\s)]+)\)/g)];
  return <>{links.map((match, index) => {
    const href = match[2]!;
    return <Button key={`${index}:${href}`} size="sm" variant="link" onClick={() => {
      if (href.startsWith('/~/session/')) {
        try { void host.openSession(decodeURIComponent(href.slice('/~/session/'.length).replace(/\/$/, ''))); } catch { /* Invalid stored link. */ }
      } else void navigation.open({ href });
    }}>{match[1]}</Button>;
  })}</>;
}
