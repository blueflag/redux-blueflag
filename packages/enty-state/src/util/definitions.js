// @flow
import type {Schema} from 'enty/lib/util/definitions';

export type Observable = {
    subscribe: Function
};

export type AsyncType = Promise<*> | Observable;
export type SideEffect = (*, Object) => AsyncType;

export type State = {
    baseSchema: Schema,
    schemas: {[key: string]: Schema},
    response: {[key: string]: *},
    error: {[key: string]: *},
    request: {[key: string]: *},
    entities: {[key: string]: *},
    stats: {
        responseCount: number
    }
};

export type Action = {
    type: 'ENTY_FETCH' | 'ENTY_ERROR' | 'ENTY_RECEIVE' | 'ENTY_REMOVE' | 'ENTY_RESET' | 'ENTY_INIT',
    payload: any,
    meta: {
        responseKey: string
    }
};
