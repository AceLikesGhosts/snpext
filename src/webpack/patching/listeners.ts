import type { AnyFunction } from '@/utils/patcher';
import type { WebpackFilter } from '../types';

export const moduleListeners = new Map<
    WebpackFilter,
    AnyFunction
>();
