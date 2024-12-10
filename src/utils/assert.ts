// arrow function version would require a type so it is
// explicitly typed i.e. const assertType: AssertType = (...) ...
// with AssertType typed as `type AssertType = <T>(thing: any): asserts thing is T => void;`
// and thats just too much for the sake of an arrow function
// https://github.com/microsoft/TypeScript/issues/34523
export function assertType<T>(thing: any): asserts thing is T { }

export const looseAssert = (condition: boolean): boolean => !condition;
export const strictAssert = (condition: boolean, message?: string) => {
    if(condition) {
        return;
    }

    const e = new Error(message ?? 'assertion failed');
    e.cause = 'Assertion Failure';
    e.name = 'AssertionError';
    throw e;
};
