// Two routes do not earn a router dependency — the ticket said so and it is still true. This is
// the whole of it: the pathname is state, a click pushes and sets it, and the back button is a
// popstate listener. The server already answers any unknown path with index.html, so a reload
// or a pasted url lands on the right page.
import { useEffect, useState } from 'react';

export const routes = ['/', '/hk'] as const;

export const navigate = (to: string) => {
    window.history.pushState(null, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
};

// Module scope, so the effect below has nothing to depend on: a reader rebuilt every render
// would be a new dependency every render.
const read = () => ({
    params: new URLSearchParams(window.location.search),
    path: window.location.pathname,
});

export const useRoute = () => {
    const [route, setRoute] = useState(read);

    useEffect(() => {
        const onPop = () => setRoute(read());

        window.addEventListener('popstate', onPop);

        return () => window.removeEventListener('popstate', onPop);
    }, []);

    return route;
};

/* Types */
export type RoutePath = (typeof routes)[number];
