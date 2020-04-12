//@flow
import type {Schema} from 'enty/lib/util/definitions';
import type {State, Action} from './util/definitions';

import clone from 'unmutable/lib/clone';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import merge from 'unmutable/lib/merge';
import pipeWith from 'unmutable/lib/util/pipeWith';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import hasIn from 'unmutable/lib/hasIn';
import updateIn from 'unmutable/lib/updateIn';
import deleteIn from 'unmutable/lib/deleteIn';
import REMOVED_ENTITY from 'enty/lib/util/RemovedEntity';

import Message from './data/Message';


export default function EntityReducerFactory(config: {schema?: Schema}): Function {
    const {schema} = config;

    return function EntityReducer(previousState: State, {type, payload, meta = {}}: Action): State {


        let state = previousState || {
            baseSchema: schema,
            schemas: {},
            response: {},
            error: {},
            request: {},
            entities: {},
            stats: {
                responseCount: 0
            }
        };

        const {responseKey} = meta;
        const requestPath = ['request', responseKey];
        const responsePath = ['response', responseKey];
        const errorPath = ['error', responseKey];
        const incrementResponseCount = updateIn(['stats', 'responseCount'], count => count + 1);




        switch (type) {
            case 'ENTY_FETCH': {
                let message = getIn(requestPath)(state);
                let hasResponse = hasIn(responsePath)(state);
                if(message && hasResponse) {
                    state = setIn(requestPath, Message.refetching())(state);
                } else {
                    state = setIn(requestPath, Message.fetching())(state);
                }
                return state;
            }

            case 'ENTY_ERROR':
                return pipeWith(
                    state,
                    setIn(requestPath, Message.error()),
                    setIn(errorPath, payload)
                );

            case 'ENTY_RECEIVE':

                // set success action before payload tests
                // to make sure the request state is still updated even if there is no payload
                state = setIn(requestPath, Message.success())(state);

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
                    setIn(requestPath, Message.empty()),
                    deleteIn(responsePath)
                );

            default:
                return state;
        }
    };
}
