import { StrictMode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

import { makeQueryClient } from '@/queries.ts';
import { App } from '@/shell.tsx';
import './theme.css';

// One client for the life of the tab: it is what survives a route change, which is the point.
const queryClient = makeQueryClient();

const root = document.getElementById('root');

if (!root) throw new Error('#root missing');

createRoot(root).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </StrictMode>,
);
