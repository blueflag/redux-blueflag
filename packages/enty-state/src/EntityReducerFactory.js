//@flow
import type {Schema} from 'enty/lib/util/definitions';
import type {State, Action} from './util/definitions';

import clone from 'unmutable/lib/clone';
import get from 'unmutable/lib/get';
import merge from 'unmutable/lib/merge';
import pipeWith from 'unmutable/lib/util/pipeWith';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import updateIn from 'unmutable/lib/updateIn';
import deleteIn from 'unmutable/lib/deleteIn';
import REMOVED_ENTITY from 'enty/lib/util/RemovedEntity';


export default function EntityReducerFactory(config: {schema?: Schema}): Function {
    const {schema} = config;

    return function EntityReducer(previousState: State, {type, payload, meta = {}}: Action): State {


        let state = previousState || {
            baseSchema: schema,
            schemas: {},
            entities: {},
            request: {},
            stats: {
                responseCount: 0
            }
        };

        const {responseKey} = meta;
        const requestPath = ['request', responseKey];
        const requestStatePath = ['request', responseKey, 'requestState'];
        const responsePath = ['request', responseKey, 'response'];
        const incrementResponseCount = updateIn(['stats', 'responseCount'], count => count + 1);




        switch (type) {
            case 'ENTY_FETCH': {
                return pipeWith(
                    state,
                    updateIn(requestPath, (request = {}) => ({
                        ...request,
                        requestState: request.response ? 'refetching' : 'fetching'
                    }))
                );
            }

            case 'ENTY_ERROR':
                return pipeWith(
                    state,
                    updateIn(requestPath, (request = {}) => ({
                        ...request,
                        requestState: 'error',
                        requestError: payload
                    }))
                );

            case 'ENTY_RECEIVE':

                // set success action before payload tests
                // to make sure the request state is still updated even if there is no payload
                state = setIn(['request', responseKey, 'requestState'], 'success')(state);

                if(payload) {
                    if(schema) {
                        const {result, entities, schemas} = schema.normalize(
                            payload,
                            pipeWith(state, get('entities'), clone())
                        );

                        return pipeWith(
                            state,
                            set('entities', entities),
                            setIn(responsePath, result),
                            updateIn(['schemas'], merge(schemas)),
                            incrementResponseCount,
                        );

                    } else {
                        return pipeWith(
                            state,
                            setIn(responsePath, payload),
                            incrementResponseCount
                        );
                    }
                }
                return state;

            case 'ENTY_REMOVE':
                return pipeWith(
                    state,
                    incrementResponseCount,
                    setIn(['entities', ...payload], REMOVED_ENTITY)
                );

            case 'ENTY_RESET':
                return pipeWith(
                    state,
                    incrementResponseCount,
                    setIn(requestStatePath, 'empty'),
                    deleteIn(responsePath)
                );

            default:
                return state;
        }
    };
}
