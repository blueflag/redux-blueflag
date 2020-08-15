import {Schema} from 'enty/lib/util/definitions';

export type Observable = {
    subscribe: Function;
};

export type AsyncType = Promise<any> | Observable | AsyncGenerator<any, any, any>;
export type SideEffect = (arg0: any, arg1: Object) => AsyncType;

export type State = {
    baseSchema?: Schema;
    schemas: {
        [key: string]: Schema;
    };
    response: {
        [key: string]: any;
    };
    error: {
        [key: string]: any;
    };
    requestState: {
        [key: string]: any;
    };
    entities: {
        [key: string]: any;
    };
    stats: {
        responseCount: number;
    };
};

export type Action = {
    type: 'ENTY_FETCH' | 'ENTY_ERROR' | 'ENTY_RECEIVE' | 'ENTY_REMOVE' | 'ENTY_RESET' | 'ENTY_INIT';
    payload: any;
    meta: {
        responseKey: string;
    };
};
