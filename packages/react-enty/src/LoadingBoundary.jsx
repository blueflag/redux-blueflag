// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type Message from 'enty-state/lib/data/Message';

import React from 'react';

type Props<R, E> = {
    children: (response: mixed, {refetching: boolean}) => Node,
    message: Message<R, E>,
    fallbackOnRefetch?: boolean,
    fallback?: ComponentType<*>,
    error?: ComponentType<*>,
    empty?: ComponentType<*>
};

const NullRender = () => null;

export default function LoadingBoundary<R, E>(props: Props<R, E>): Node {
    // Config
    const {children} = props;
    const {message} = props;
    const {fallbackOnRefetch = false} = props;
    const {fallback: Fallback = NullRender} = props;
    const {empty: Empty = NullRender} = props;
    const {error: Error = NullRender} = props;

    // Possible States
    const emptyState = () => <Empty />;
    const errorState = () => <Error error={message.requestError} />;
    const fallbackState = () => <Fallback />;
    const renderState = () => children(message.response, {
        refetching: message.requestState.isRefetching === true
    });

    // Render
    return message
        .emptyMap(emptyState)
        .fetchingMap(fallbackState)
        .refetchingMap(fallbackOnRefetch ? fallbackState : renderState)
        .successMap(renderState)
        .errorMap(errorState)
        .value;
}

