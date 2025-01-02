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
        if(descriptor.get && !descriptor.set) {
            descriptor.configurable = true;

            let iv = descriptor.get.bind(obj);

            descriptor.get = iv;
            descriptor.set = (v) => iv = v;
        }

        return original(obj, prop, descriptor);
    });

export * as storage from './utils/storage';
export * as plugins from './plugins/api';
export * as webpack from './webpack/index';
export * as store from './utils/reactiveStore/index';