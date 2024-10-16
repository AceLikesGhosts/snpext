export type PromiseResolve = () => void;
export default function wait(): [Promise<void>, PromiseResolve] {
    let resolver: PromiseResolve;
    const promise = new Promise<void>((resolve) => resolver = resolve);

    return [promise, resolver!];
}