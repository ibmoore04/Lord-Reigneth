// ============================================================
// RouteScrollReset — scrolls the window to the top whenever
// the route changes. Mount this once inside the router.
// ============================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
