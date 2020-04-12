// @flow
import type {Node} from 'react';
import type {ComponentType} from 'react';
import type Message from 'enty-state/lib/data/Message';

import React from 'react';

type Props = {
    children: (response: mixed, {refetching: boolean}) => Node,
    message: Message,
    fallbackOnRefetch?: boolean,
    fallback?: ComponentType<*>,
    error?: ComponentType<*>,
    empty?: ComponentType<*>
};

const NullRender = () => null;

export default function LoadingBoundary(props: Props): Node {
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
    const renderState = () => children(message.response, {refetching: message.isRefetching === true});

    // Render
    return message
        .emptyMap(emptyState)
        .fetchingMap(fallbackState)
        .refetchingMap(fallbackOnRefetch ? fallbackState : renderState)
        .successMap(renderState)
        .errorMap(errorState)
        .value;
}

