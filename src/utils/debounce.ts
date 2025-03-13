export function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    // weird issue with node not agreeing with
    // the type of `Timer` from `NodeJS.Timer`??
    let timeout: globalThis.Timer | null = null;

    return (...args: Parameters<T>) => {
        if(timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}
