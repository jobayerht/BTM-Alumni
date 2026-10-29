import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface NavigateOptions {
  restoreScroll?: boolean;
}

interface RouterContextValue {
  path: string;
  previousPath: string | null;
  navigate: (to: string, options?: NavigateOptions) => void;
  goBack: (fallbackPath?: string) => void;
}

const SCROLL_STORAGE_KEY = 'btm_route_scroll_positions_v1';

function normalizeRouteKey(rawPath: string): string {
  const clean = (rawPath || '/').split('?')[0].replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

function loadScrollMap(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveScrollMap(map: Record<string, number>) {
  try {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  previousPath: null,
  navigate: () => {},
  goBack: () => {},
});

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    const p = window.location.pathname + window.location.search;
    return p === '' ? '/' : p;
  });
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  const scrollPositionsRef = useRef<Record<string, number>>(loadScrollMap());
  const currentPathRef = useRef<string>(path);
  const pendingScrollRestoreRef = useRef<number | null>(null);

  // Track scroll position continuously for the active route
  useEffect(() => {
    const handleScroll = () => {
      const key = normalizeRouteKey(currentPathRef.current);
      scrollPositionsRef.current[key] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply scroll restoration or top scroll right after path updates and DOM renders
  useEffect(() => {
    currentPathRef.current = path;

    if (pendingScrollRestoreRef.current !== null) {
      const targetY = pendingScrollRestoreRef.current;
      pendingScrollRestoreRef.current = null;

      window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
      const raf1 = requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
        requestAnimationFrame(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
        });
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [path]);

  useEffect(() => {
    const handlePopState = () => {
      const nextPath = (window.location.pathname || '/') + (window.location.search || '');
      const prevKey = normalizeRouteKey(currentPathRef.current);
      scrollPositionsRef.current[prevKey] = window.scrollY;
      saveScrollMap(scrollPositionsRef.current);

      const nextKey = normalizeRouteKey(nextPath);
      const savedY = scrollPositionsRef.current[nextKey];
      if (typeof savedY === 'number') {
        pendingScrollRestoreRef.current = savedY;
      }

      setPreviousPath(currentPathRef.current);
      setPath(nextPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: NavigateOptions) => {
    const clean = to.startsWith('/') ? to : `/${to}`;
    const fromKey = normalizeRouteKey(currentPathRef.current);
    const toKey = normalizeRouteKey(clean);

    // Save current scroll position before leaving
    scrollPositionsRef.current[fromKey] = window.scrollY;
    saveScrollMap(scrollPositionsRef.current);

    // Automatically restore scroll if returning from an alumni profile to a batch/directory page,
    // or if restoreScroll is explicitly requested
    const isReturningFromProfile =
      fromKey.startsWith('/alumni/') &&
      (toKey.startsWith('/batch/') || toKey === '/alumni' || toKey === '/batches' || toKey === '/');

    if ((options?.restoreScroll || isReturningFromProfile) && typeof scrollPositionsRef.current[toKey] === 'number') {
      pendingScrollRestoreRef.current = scrollPositionsRef.current[toKey];
    } else {
      pendingScrollRestoreRef.current = null;
    }

    if (clean !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', clean);
    }
    setPreviousPath(currentPathRef.current);
    setPath(clean);
  };

  const goBack = (fallbackPath = '/batches') => {
    const target = previousPath || fallbackPath;
    navigate(target, { restoreScroll: true });
  };

  return (
    <RouterContext.Provider value={{ path, previousPath, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export function updateDocumentMeta(title: string, description: string) {
  document.title = `${title} | BTM Alumni — IUT`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${title} | BTM Alumni — IUT`);
  }
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', description);
  }
}
