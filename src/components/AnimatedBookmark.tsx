import { useEffect, useId, useRef } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';

const ease = [.22, 1, .36, 1] as const;
const flagPath = 'M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';

export default function AnimatedBookmark({ filled, size = 16, quiet = false }: { filled: boolean; size?: number; quiet?: boolean }) {
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const previous = useRef(filled);
  const clipId = `bookmark-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  useEffect(() => {
    if (previous.current === filled) return;
    previous.current = filled;
    controls.stop();
    if (reducedMotion || quiet) {
      controls.set({ y: 0, rotate: 0, scaleX: 1, scaleY: 1 });
      return;
    }
    void controls.start({
      y: filled ? [null, -2, .5, 0] : [null, 1.5, 0],
      rotate: filled ? [null, -8, 2, 0] : [null, 5, 0],
      scaleX: filled ? [null, .92, 1.02, 1] : [null, .96, 1],
      scaleY: filled ? [null, 1.08, .98, 1] : [null, .94, 1],
      transition: { duration: .42, ease },
    });
  }, [filled, reducedMotion, quiet, controls]);

  return <motion.svg className="animated-bookmark" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" animate={controls} aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}><motion.rect x="0" width="24" height="24" initial={false} animate={{ y: filled ? 0 : 24 }} transition={{ duration: reducedMotion ? 0 : .3, ease }}/></clipPath></defs>
    <path d={flagPath} fill="currentColor" stroke="none" clipPath={`url(#${clipId})`}/>
    <path d={flagPath}/>
  </motion.svg>;
}
