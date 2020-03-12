// @flow
import Message from 'enty-state/lib/data/Message';
import RequestState from 'enty-state/lib/data/RequestState';
import isObservable from 'enty-state/lib/util/isObservable';
import {useState, useEffect, useContext, useCallback, useMemo, useRef} from 'react';

type RequestHookConfig = {
    actionType: string,
    requestAction: Function,
    generateResultKey: Function
};

export default function RequestHookFactory(context: *, config: RequestHookConfig) {
    const {requestAction, generateResultKey} = config;

    return <R>() => {
        const [responseKey, setResponseKey] = useState('Unknown');
        const store = useContext(context);
        if(!store) throw 'useRequest must be called in a provider';
        const [state, dispatch] = store;
        const responseRef = useRef();
        const mounted = useRef(true);

        let requestState = state.requestState[responseKey] || RequestState.empty();

        useEffect(() => {
            return () => {
                mounted.current = false;
            };
        }, []);

        let response = useMemo(() => {
            const schema = state.baseSchema;
            const result = state.response[responseKey];
            const entities = state.entities;
            if(schema) {
                return schema.denormalize({entities, result});
            }
            return result;

        }, [requestState, responseKey, state.stats.responseCount]);

        responseRef.current = response;

        let onRequest = useCallback((payload, {returnResponse = false} = {}) => {
            const responseKey = generateResultKey(payload);
            setResponseKey(responseKey);
            const pending = dispatch(requestAction(payload, {responseKey}));


            if (isObservable(pending) && returnResponse) {
                return pending;
            }

            return returnResponse
                ? pending.then(() => mounted.current ? responseRef.current : undefined)
                : pending.then(() => {}).catch(() => {});
        });


        return useMemo(() => new Message<R>({
            responseKey,
            requestState,
            response,
            requestError: state.error[responseKey],
            onRequest
        }), [requestState, response, responseKey]);
    };
}
