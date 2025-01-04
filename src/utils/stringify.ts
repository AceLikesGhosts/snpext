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
        // using function prototype to string results in
        // skipping over the `toString` function, which will
        // result a patched function not being able to be found
        // with the same query
        // return Function.prototype.toString.call(thing);

        return thing.toString();
    }

    if(typeof thing === 'object') {
        return JSON.stringify(thing, getCircularReplacer()) || '';
    }

    return thing?.toString() || Object.prototype.toString.apply(thing);
}