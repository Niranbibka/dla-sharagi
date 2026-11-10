import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useInView, useReducedMotion, useScroll } from 'motion/react';
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Braces, Check, ChevronRight, Code2, Copy, MessageSquare, Moon, Search, Sun, Terminal, TextCursorInput } from 'lucide-react';
import { articles, type Article } from './data/articles';
import LiquidTabs from './components/LiquidTabs';
import AnimatedBookmark from './components/AnimatedBookmark';
import SavedToggle from './components/SavedToggle';

type VisualProps = { type: Article['visual'] };
const motionEase = [.22, 1, .36, 1] as const;
const feedback = { duration: .18, ease: motionEase };
const stars = [[7,11],[22,7],[47,4],[68,12],[93,5],[3,37],[98,28],[53,30],[26,48],[74,45],[9,64],[93,62],[45,69],[66,77],[16,89],[35,95],[84,94]];
type Theme = 'light' | 'dark';
type PageTransition = { finished: Promise<void>; ready: Promise<void>; skipTransition: () => void };
let activePageTransition: PageTransition | null = null;
let navigationSequence = 0;

function transitionPage(update: () => void, scrollTop = 0) {
  activePageTransition?.skipTransition();
  activePageTransition = null;
  const sequence = ++navigationSequence;
  const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => PageTransition };
  const apply = () => {
    if (sequence !== navigationSequence) return;
    flushSync(update);
    window.scrollTo({ top: scrollTop, behavior: 'instant' });
  };
  if (!transitionDocument.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply();
    return;
  }
  const transition = transitionDocument.startViewTransition(apply);
  activePageTransition = transition;
  void transition.ready.catch(() => {});
  void transition.finished.catch(() => {}).finally(() => {
    if (activePageTransition === transition) activePageTransition = null;
  });
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const label = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
  return <motion.button className="theme-toggle" onClick={onToggle} aria-label={label} title={label} whileTap={{ scale: .97 }}>
    <AnimatePresence initial={false} mode="wait"><motion.span className="theme-icon" key={theme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={feedback}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}</motion.span></AnimatePresence>
  </motion.button>;
}

function ArticleVisual({ type }: VisualProps) {
  let content;
  if (type === 'structure') content = <div className="prompt-stack"><div className="prompt-layer"><span>Задача</span><ArrowRight size={16}/></div><div className="prompt-layer"><span>Контекст</span><TextCursorInput size={16}/></div><div className="prompt-layer"><span>Критерии</span><Check size={16}/></div></div>;
  else if (type === 'code') content = <div className="code-window"><div className="window-dots"><i/><i/><i/></div><div className="code-lines"><span><em>const</em> brief = {'{'}</span><span>&nbsp;&nbsp;goal: <strong>"ship it"</strong>,</span><span>&nbsp;&nbsp;scope: <strong>"small"</strong></span><span>{'}'}</span><span className="code-tag">// build, test, repeat</span></div></div>;
  else if (type === 'context') content = <div className="context-orbits"><div className="orbit-ring one"/><div className="orbit-ring two"/><div className="orbit-center"><Braces size={16}/></div></div>;
  else if (type === 'iteration') content = <div className="iteration-flow"><div className="flow-node active">1</div><ChevronRight/><div className="flow-node">2</div><ChevronRight/><div className="flow-node">3</div></div>;
  else if (type === 'tools') content = <div className="tool-grid"><div><MessageSquare size={16}/><small>Чат</small></div><div><Code2 size={16}/><small>Код</small></div><div><Terminal size={16}/><small>Тест</small></div><div><ArrowUpRight size={16}/><small>Запуск</small></div></div>;
  else content = <div className="system-terminal"><span>&gt;_</span><small>system / ready</small></div>;
  return <div className={`card-visual visual-${type}`} aria-hidden="true"><div className="visual-parallax">{content}</div></div>;
}

type CardProps = { article: Article; saved: boolean; onOpen: () => void; onSave: () => void; wide?: boolean; index: number; revealImmediately: boolean };

const ArticleCard = forwardRef<HTMLElement, CardProps>(function ArticleCard({ article, saved, onOpen, onSave, wide, index, revealImmediately }, externalRef) {
  const cardRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const visible = useInView(cardRef, { once: true, amount: .12 });
  const shown = reducedMotion || revealImmediately || visible;
  return <motion.article
    ref={node => { cardRef.current = node; if (typeof externalRef === 'function') externalRef(node); else if (externalRef) externalRef.current = node; }}
    layout="position"
    className={`article-card ${article.featured ? 'card-featured' : ''} ${wide ? 'card-wide' : ''}`}
    initial={reducedMotion || revealImmediately ? false : { opacity: 0, y: 14 }}
    animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 14 }}
    exit={{ opacity: 0, transition: { duration: .12, delay: 0 } }}
    transition={{ duration: .48, ease: motionEase, opacity: { duration: .32, delay: Math.min(index, 5) * .055 }, layout: { duration: .42, ease: motionEase } }}
  >
    <motion.button className={`bookmark-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-pressed={saved} aria-label={saved ? 'Убрать из сохранённых' : 'Сохранить статью'}>
      <AnimatedBookmark filled={saved}/>
    </motion.button>
    <button className="card-link" onClick={onOpen} aria-label={`Открыть статью: ${article.title}`} />
    <div className="card-artwork"><ArticleVisual type={article.visual}/></div>
    <div className="card-body">
      <div className="card-category">{article.category}</div>
      <h3>{article.title}</h3>
      <p className="card-excerpt">{article.excerpt}</p>
      <div className="card-meta"><span>{article.date}</span><span>·</span><span>{article.readTime} мин чтения</span><ArrowUpRight size={15} className="card-arrow" /></div>
    </div>
  </motion.article>;
});

function ReadingPage({ article, saved, onBack, onSave, onOpen }: { article: Article; saved: boolean; onBack: () => void; onSave: () => void; onOpen: (id: string) => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const copy = async (code: string) => { await navigator.clipboard?.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 1400); };
  return <main className="reading-page">
    <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true"/>
    <button className="back-link" onClick={onBack}><ArrowLeft size={16}/> Все статьи</button>
    <div className="reading-category">{article.category} <span>·</span> {article.date}</div>
    <h1 className="reading-title">{article.title}</h1>
    <p className="reading-excerpt">{article.excerpt}</p>
    <div className="reading-meta"><span>{article.readTime} мин чтения</span><button className={`reading-save ${saved ? 'saved' : ''}`} onClick={onSave}><AnimatedBookmark filled={saved} size={15}/>{saved ? 'Сохранено' : 'Сохранить'}</button></div>
    <div className="reading-cover"><ArticleVisual type={article.visual}/></div>
    <div className="article-content">{article.sections.map((section) => <motion.section className="reading-reveal" key={section.heading} initial={reducedMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .24, ease: motionEase }}><h2>{section.heading}</h2><p>{section.body}</p>{section.code && <div className="code-block"><button className="copy-button" onClick={() => copy(section.code!)}>{copied === section.code ? <Check size={15}/> : <Copy size={15}/>} {copied === section.code ? 'Скопировано' : 'Копировать'}</button><pre>{section.code}</pre></div>}</motion.section>)}</div>
    <div className="article-tags">{article.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
    <div className="related-block"><div className="related-heading"><h2>Читайте дальше</h2><button onClick={onBack}>Все материалы <ArrowUpRight size={15}/></button></div><div className="related-grid">{articles.filter(a => a.id !== article.id).slice(0,2).map(a => <button key={a.id} onClick={() => onOpen(a.id)} className="related-card"><span>{a.category}</span><b>{a.title}</b><small>{a.readTime} мин <ArrowUpRight size={13}/></small></button>)}</div></div>
  </main>;
}

function Journal({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(() => window.location.hash.slice(1) || null);
  const [savedIds, setSavedIds] = useState<string[]>(() => { try { const stored = JSON.parse(localStorage.getItem('prompt-journal-saved') || '[]'); return Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : []; } catch { return []; } });
  const [showSaved, setShowSaved] = useState(false);
  const [revealImmediately, setRevealImmediately] = useState(false);
  const catalogScroll = useRef(0);
  const routeTarget = useRef(selectedId);
  useEffect(() => { localStorage.setItem('prompt-journal-saved', JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onLocationChange = () => {
      const nextId = window.location.hash.slice(1) || null;
      if (nextId === routeTarget.current) return;
      routeTarget.current = nextId;
      const targetScroll = nextId ? 0 : (window.history.state?.journalScroll ?? catalogScroll.current);
      transitionPage(() => { setSelectedId(nextId); if (!nextId) setRevealImmediately(true); }, targetScroll);
    };
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, []);
  const selected = articles.find(a => a.id === selectedId);
  const filtered = useMemo(() => articles.filter(a => (activeCategory === 'Все' || a.category === activeCategory) && (!showSaved || savedIds.includes(a.id)) && (!query || `${a.title} ${a.excerpt} ${a.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))), [activeCategory, query, showSaved, savedIds]);
  const toggleSave = (id: string) => setSavedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const open = (id: string) => {
    if (!selected) {
      catalogScroll.current = window.scrollY;
      window.history.replaceState({ ...window.history.state, journalScroll: window.scrollY }, '', window.location.href);
    }
    routeTarget.current = id;
    transitionPage(() => {
      window.history.pushState({ articleId: id }, '', `#${id}`);
      setSelectedId(id);
    });
  };
  const goHome = () => {
    routeTarget.current = null;
    transitionPage(() => {
      setRevealImmediately(true);
      setSelectedId(null);
      window.history.pushState({ journalScroll: catalogScroll.current }, '', window.location.pathname + window.location.search);
    }, catalogScroll.current);
  };
  if (selected) return <><header className="site-header"><div className="container header-inner plain-header"><button className="brand" onClick={goHome}>промпт<span className="brand-dot">.</span></button><div className="reading-header-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme}/><button className="reading-close" onClick={goHome}>Все статьи <ArrowUpRight size={15}/></button></div></div></header><ReadingPage key={selected.id} article={selected} saved={savedIds.includes(selected.id)} onOpen={open} onBack={goHome} onSave={() => toggleSave(selected.id)}/></>;
  return <LayoutGroup id="journal"><div className="app-shell">
    <main className="journal-section container" id="journal">
        <h1 className="visually-hidden">Журнал о промптинге и вайбкодинге</h1>
        <div className="filter-bar"><button className="brand" onClick={() => { setActiveCategory('Все'); setShowSaved(false); setQuery(''); }}>промпт<span className="brand-dot">.</span></button><LiquidTabs values={['Все','Промптинг','Вайбкодинг','Инструменты']} value={showSaved ? null : activeCategory} onChange={category => { setActiveCategory(category); setShowSaved(false); }}/><div className="toolbar-actions"><label className="search-field"><Search size={16}/><input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск" aria-label="Найти статью"/></label><SavedToggle count={savedIds.length} active={showSaved} onClick={() => { setActiveCategory('Все'); setShowSaved(v => !v); }}/><ThemeToggle theme={theme} onToggle={onToggleTheme}/></div></div>
        <div className="article-grid" aria-live="polite"><AnimatePresence mode="popLayout">{filtered.map((article, index) => <ArticleCard key={article.id} article={article} index={index} revealImmediately={revealImmediately} wide={article.id === 'code-quality'} saved={savedIds.includes(article.id)} onOpen={() => open(article.id)} onSave={() => toggleSave(article.id)}/>)}{filtered.length === 0 && <motion.div className="empty-state" key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Bookmark size={24}/><h3>Пока ничего</h3><p>{showSaved ? 'Сохраняйте статьи, чтобы вернуться к ним позже.' : 'Попробуйте другой запрос.'}</p></motion.div>}</AnimatePresence></div>
        {(query || showSaved || activeCategory !== 'Все') && <button className="load-more" onClick={() => { setQuery(''); setActiveCategory('Все'); setShowSaved(false); }}>Сбросить фильтры <ArrowDownRight size={16}/></button>}
    </main></div></LayoutGroup>;
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => { try { return localStorage.getItem('prompt-journal-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } });
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#fafafa');
    try { localStorage.setItem('prompt-journal-theme', theme); } catch { /* The theme still works when storage is unavailable. */ }
  }, [theme]);
  return <MotionConfig reducedMotion="user" transition={feedback}><div className="ambient-background" aria-hidden="true"><div className="star-field">{stars.map(([left, top], index) => <i key={index} style={{ left: `${left}%`, top: `${top}%` }}/>)}</div></div><Journal theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}/></MotionConfig>;
}

export default App;
