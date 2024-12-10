import { assertType } from '../assert';

export type StoreListener<T> = (newState: T) => void;

export default class ReactiveStore<T> {
    public constructor(
        public store: T = {} as T,
        private readonly listeners: Set<StoreListener<T>> = new Set
    ) {
        this.store = this.createReactiveProxy(store);
    }

    public subscribe(listener: StoreListener<T>) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    public unsubscribe(listener: StoreListener<T>) {
        this.listeners.delete(listener);
    }

    private notifyListeners() {
        for(const listener of this.listeners) {
            listener(this.store);
        }
    }

    private createReactiveProxy(obj: any): any {
        if(typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if(Array.isArray(obj)) {
            return this.createReactiveArrayProxy(obj);
        }

        return new Proxy(obj, {
            get: (target, prop) => {
                return target[prop];
            },
            set: (target, prop, value) => {
                if(typeof value === 'object' && value !== null) {
                    this.createReactiveProxy(value);
                }

                target[prop] = value;
                this.notifyListeners();
                return true;
            }
        });
    }

    private createReactiveArrayProxy(store: any[]): any[] {
        return new Proxy(store, {
            get: (target, prop) => {
                assertType<keyof typeof target>(prop);
                const value = target[prop];

                if(typeof value === 'object' || value !== null) {
                    return this.createReactiveProxy(value);
                }

                return value;
            },
            set: (target, prop, value) => {
                assertType<
                    keyof typeof target &
                    typeof target extends string ? typeof target : never
                >(prop);

                target[prop] = value;
                this.notifyListeners();
                return true;
            },
        });
    }
}