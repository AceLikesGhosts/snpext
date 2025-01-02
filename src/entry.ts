import { Patcher } from './utils/patcher';

Object.freeze(console); // FUCK YOU SNAPCHAT!

// this is a workaround to the fact
// that webpack exports elements using `defineProperty`
// with only a getter, which makes it impossible to
// patch them normally, (i.e. patching the main React entrypoint)
// this *FOR NOW* only patches functions allowing for replacing
// them via the patcher

// this was added 08/12/24
// for the settings core plugin
new Patcher('internal')
    .instead(Object, 'defineProperty', (
        [obj, prop, descriptor],
        original
    ) => {
        // if(typeof descriptor.get === 'function' && typeof descriptor.set === 'undefined') {
        //     if(descriptor.hasOwnProperty('value') || descriptor.hasOwnProperty('writable')) {
        //         throw new TypeError('Cannot specify both accessors and a value/writable attribute.');
        //     }

        //     descriptor.configurable = true;

        //     // descriptor.value = descriptor.get;
        //     // descriptor.get = () => descriptor.value
        //     let internalValue;

        //     descriptor.get = function() {
        //         return internalValue || descriptor.get?.bind(obj)
        //     }

        //     descriptor.set = descriptor.set || function (newValue: any) {
        //         console.log(`Setter called for getter-based function: ${ prop }`);
        //         internalValue = newValue;
        //     };
        // }

        if(descriptor.get && !descriptor.set) {
            descriptor.configurable = true;

            let iv = descriptor.get.bind(obj);
            // delete descriptor.get;

            descriptor.get = iv;
            descriptor.set = (v) => iv = v;
            // descriptor.value = iv.bind(obj);
        }

        return original(obj, prop, descriptor);
    });

export * as storage from './utils/storage';
export * as plugins from './plugins/api';
export * as webpack from './webpack/index';
export * as store from './utils/reactiveStore/index';