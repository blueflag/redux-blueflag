// @flow
import type {State, Action} from './definitions';
const css = 'color: #7E488B;';

/* eslint-disable no-console */
const log = (first: string, ...rest: mixed[]) => console.log(`%c${first}`, css, ...rest);
const group = (name: string) => console.group(`%c[${name}]`, css);
const groupEnd = () => console.groupEnd();
/* eslint-enable no-console */

export default function LoggingReducer(state: State, action: Action, debugName: string) {
    const {type, meta = {}, payload} = action;

    group(`${debugName}: ${type}`);

    const {responseKey} = meta;
    const requestState = state.request[responseKey];
    const requestStateType = requestState && requestState
        .emptyMap(() => 'empty')
        .fetchingMap(() => 'fetching')
        .refetchingMap(() => 'refetching')
        .errorMap(() => 'error')
        .successMap(() => 'success')
        .value;

    if (type === 'ENTY_FETCH') {
        log('responseKey:', responseKey, requestStateType);
    }
    else if (type === 'ENTY_RECEIVE') {
        log('responseKey:', responseKey, requestStateType);
        log('stats.responseCount', state.stats.responseCount);
        log('payload:', payload);
        log('response:', state.response[responseKey]);
        log('entities:', state.entities);
    }
    else if (type === 'ENTY_ERROR') {
        log('responseKey:', responseKey, requestStateType);
        log('error:', state.error[responseKey]);
    }
    else if (type === 'ENTY_REMOVE') {
        log('stats.responseCount', state.stats.responseCount);
        log('remove:', payload.join && payload.join('.'));
        log(`entities.${payload[0]}:`, state.entities[payload[0]]);
    }
    groupEnd();
    return state;
}

