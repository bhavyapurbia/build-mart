import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures whenever the user clicks any category, brand, product,
 * or navigation link, the viewport resets to the top instead of staying at the footer.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Immediate scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Fallback for documentElement and body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Microtask to catch async React lazy route mounting & layout shifts
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 60);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
