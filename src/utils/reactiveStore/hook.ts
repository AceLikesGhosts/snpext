import { React } from '@/webpack/common';
import type ReactiveStore from './store';

export default function useReactiveStore<T>(store: ReactiveStore<T>) {
    const [storeState, setStoreState] = React.useState(store.store);

    React.useEffect(() => {
        const unsub = store.subscribe((newStore) => setStoreState(newStore));
        return () => void unsub();
    }, [store.store]);

    return storeState;
}