import { Patcher } from './utils/patcher/patcher';

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
        [object, propertyKey, descriptor],
        original,
        context
    ) => {
        if(descriptor.get && !descriptor.set) {
            const value = {} as { current: any; };

            const originalGetter = descriptor.get;
            descriptor.get = () => value.current || originalGetter.bind(context).call(object);
            descriptor.set = (v) => value.current = v;
        }

        return original(object, propertyKey, descriptor);
    });

export * as storage from './utils/storage';
export * as plugins from './plugins/api';
export * as webpack from './webpack/index';
export * as store from './utils/reactiveStore/index';
export * as patcher from './utils/patcher/patcher';
export * as reactiveStore from './utils/reactiveStore';