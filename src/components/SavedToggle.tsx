import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import AnimatedBookmark from './AnimatedBookmark';

const ease = [.22, 1, .36, 1] as const;

export default function SavedToggle({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  const reducedMotion = useReducedMotion();
  const hasCount = count > 0;
  const width = hasCount ? 40 + String(count).length * 6 : 32;
  return <motion.button className={`saved-toggle ${active ? 'active' : ''}`} aria-label={`Сохранённые статьи${hasCount ? `: ${count}` : ''}`} aria-pressed={active} onClick={onClick}
    initial={false} animate={{ width }} transition={{ duration: reducedMotion ? 0 : .34, ease }}>
    <span className="saved-toggle-icon"><AnimatedBookmark filled={active} size={17} quiet/></span>
    <AnimatePresence initial={false}>
      {hasCount && <motion.span className="saved-count" key={count} aria-hidden="true"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
        animate={{ opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : .22, delay: reducedMotion ? 0 : .06, ease } }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : -4, transition: { duration: reducedMotion ? 0 : .14, ease } }}>{count}</motion.span>}
    </AnimatePresence>
  </motion.button>;
}
