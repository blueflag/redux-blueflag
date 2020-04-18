// @flow
import type {ComponentType} from 'react';
import type {AbstractComponent} from 'react';
import type Message from 'enty-state/lib/data/Message';

import React from 'react';
import LoadingBoundary from './LoadingBoundary';

type Config = {
    name: string,
    empty?: ComponentType<*>,
    error?: ComponentType<*>,
    fallback?: ComponentType<*>,
    fallbackOnRefetch?: boolean,
    mapResponseToProps?: (response: mixed) => Object
};

type HocProps = {
    [name: string]: Message
};

const returnObject: (payload?: mixed) => Object = () => ({});

export default function LoadingBoundaryHoc(config: Config) {
    const {
        mapResponseToProps = returnObject,
        name,
        ...remainingConfig
    } = config;

    return function LoadingBoundaryApplier<Props: {} & HocProps>(Component: AbstractComponent<Props>): AbstractComponent<Props> {
        return (props) => {
            const message: Message = props[name];
            return <LoadingBoundary
                {...remainingConfig}
                message={message}
                children={(response) => {
                    let childProps = mapResponseToProps(response);
                    childProps[name] = message;
                    return <Component {...props} {...childProps} />;
                }}
            />;
        };
    };
}


