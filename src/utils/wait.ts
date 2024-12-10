export type PromiseResolve<T> = (args: T) => void;
export default function wait<T = void>(): [Promise<T>, PromiseResolve<T>] {
    let resolver: PromiseResolve<T>;
    const promise = new Promise<T>((resolve) => resolver = resolve);

    return [promise, resolver!];
}