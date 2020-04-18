// @flow
import Message from 'enty-state/lib/data/Message';
import {useState, useEffect, useContext, useCallback, useMemo, useRef} from 'react';
import getIn from 'unmutable/getIn';

type RequestHookConfig = {
    actionType: string,
    requestAction: Function,
    resetAction: Function,
    removeEntityAction: Function,
    generateResultKey: Function
};

type Config = {
    key: string
};

export default function RequestHookFactory(context: *, config: RequestHookConfig) {
    const {requestAction, resetAction, removeEntityAction, generateResultKey} = config;

    return (config: Config = {}) => {
        const [derivedResponseKey, setDerivedResponseKey] = useState('Unknown');
        const responseKey = config.key || derivedResponseKey;
        const store = useContext(context);
        if(!store) throw 'useRequest must be called in a provider';
        const [state, dispatch] = store;
        const responseRef = useRef();
        const mounted = useRef(true);

        let messageData = state.request[responseKey] || {};

        useEffect(() => {
            return () => {
                mounted.current = false;
            };
        }, []);

        let response = useMemo(() => {
            const {baseSchema, request, entities} = state;
            const result = getIn([responseKey, 'response'])(request);
            if(baseSchema) {
                return baseSchema.denormalize({entities, result});
            }
            return result;

        }, [messageData.requestState, responseKey, state.stats.responseCount]);

        responseRef.current = response;

        let request = useCallback((payload, {returnResponse = false} = {}) => {
            const responseKey = config.key || generateResultKey(payload);
            setDerivedResponseKey(responseKey);
            return dispatch(requestAction(payload, {responseKey, returnResponse}));
        });

        let reset = useCallback(() => dispatch(resetAction(responseKey)));
        let removeEntity = useCallback((type, id) => dispatch(removeEntityAction(type, id)));

        return useMemo(() => new Message({
            ...messageData,
            removeEntity,
            request,
            requestError: getIn([responseKey, 'requestError'])(state.request),
            reset,
            response,
            responseKey
        }), [messageData.requestState, response]);
    };
}
