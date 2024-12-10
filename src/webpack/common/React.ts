import { Filters, waitForLazy } from '..';
import commonLogger from './internal';

export let React: typeof import('react');
waitForLazy<typeof import('react')>(
    Filters.byKeys('useState', 'useRef'),
    (output) => {
        React = output;
        commonLogger.verbose('found React');
    }
);

export let ReactDom: typeof import('react-dom');
waitForLazy<typeof import('react-dom')>(
    Filters?.byKeys('createRoot'),
    (output) => {
        ReactDom = output;
        commonLogger.verbose('found ReactDom');
    }
);