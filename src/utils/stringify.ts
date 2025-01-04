const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: PropertyKey, value: any) => {
        if(value === globalThis) {
            return;
        }

        if(typeof value === "object" && value !== null) {
            if(seen.has(value)) {
                return;
            }

            seen.add(value);
        }

        return value;
    };
};
export function stringify(thing: any) {
    if(typeof thing === 'function') {
        return Function.prototype.toString.call(thing);
    }

    if(typeof thing === 'object') {
        return JSON.stringify(thing, getCircularReplacer()) || '';
    }

    return thing?.toString() || Object.prototype.toString.apply(thing);
}