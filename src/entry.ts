import { Patcher } from './utils/patcher';

Object.freeze(console); // FUCK YOU SNAPCHAT!

// this is a workaround to the fact
// that webpack exports elements using `defineProperty`
// with only a getter, which makes it impossible to
// patch them normally, (i.e. patching the main React entrypoint)

// this was added 08/12/24
// for the settings core plugin
new Patcher('internal')
    .instead(Object, 'defineProperty', (
        [object, propertyKey, attributes],
        original,
        context
    ) => {
        const newAttributes = { ...attributes };

        // Check if we have a getter and no setter
        if(newAttributes.get && !newAttributes.set) {
            // Create a private variable to hold the value
            const value = { current: undefined };

            // Define a new setter that updates the private value
            newAttributes.set = (v) => {
                value.current = v;
            };

            // Define a new getter that returns the private value
            newAttributes.get = () => {
                return value.current || (value.current = attributes.get?.bind(context).call(object));
            };
        }

        // Ensure we don't mix value/writable with get/set
        if(newAttributes.get || newAttributes.set) {
            delete newAttributes.value;
            delete newAttributes.writable;
        }

        return original(object, propertyKey, newAttributes);
    });

export * as storage from './utils/storage';
export * as plugins from './plugins/api';
export * as webpack from './webpack/index';
export * as store from './utils/reactiveStore/index';