// @flow
import Message from 'enty-state/lib/data/Message';
import {EmptyState} from 'enty-state/lib/data/RequestState';
import {useState, useContext, useCallback, useMemo, useRef} from 'react';

type RequestHookConfig = {
    actionType: string,
    requestAction: Function,
    generateResultKey: Function
};

export default function RequestHookFactory(context: *, config: RequestHookConfig) {
    const {requestAction, generateResultKey} = config;

    return () => {
        const [resultKey, setResultKey] = useState();
        const store = useContext(context);
        if(!store) throw 'useRequest must be called in a provider';
        const [state, dispatch] = store;
        const responseRef = useRef();

        let requestState = state.requestState[resultKey] || EmptyState();

        let response = useMemo(() => {
            const schema = state.baseSchema;
            const result = state.result[resultKey];
            const entities = state.entities;
            if(schema) {
                return schema.denormalize({entities, result});
            }
            return result;

        }, [requestState, resultKey, state.responseCount]);

        responseRef.current = response;

        let onRequest = useCallback((payload) => {
            const resultKey = generateResultKey(payload);
            setResultKey(resultKey);
            return dispatch(requestAction(payload, {resultKey}))
                .then(() => responseRef.current)
                .catch(() => {});
        });


        return useMemo(() => new Message({
            resultKey,
            requestState,
            response,
            requestError: state.error[resultKey],
            onRequest
        }), [requestState, response, resultKey]);
    };
}
