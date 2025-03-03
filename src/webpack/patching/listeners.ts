import type { AnyFunction } from '@/utils/patcher/patcher';
import type { WebpackFilter } from '../types';

export const moduleListeners = new Map<
    WebpackFilter,
    AnyFunction
>();
