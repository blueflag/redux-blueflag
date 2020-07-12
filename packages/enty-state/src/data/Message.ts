import RequestState from '../data/RequestState';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';

type Request = (payload: unknown) => any;

type MessageInput<R, E> = {
    removeEntity: (type: string, id: string) => void;
    request: Request;
    requestError: E;
    requestState?: RequestState;
    reset: () => void;
    response: R;
    responseKey: string;
};

export default class Message<R, E = void> {
    response: R;
    requestError: E;
    request: Request;
    reset: () => void;
    removeEntity: (type: string, id: string) => void;
    responseKey: string;
    requestState: RequestState;

    constructor(props: MessageInput<R, E>) {
        this.responseKey = props.responseKey;
        this.response = props.response;
        this.requestState = props.requestState || RequestState.empty();
        this.requestError = props.requestError;
        this.request = props.request;
        this.reset = props.reset;
        this.removeEntity = props.removeEntity;
    }

    //
    // Response Getters

    get(key: string, notFoundValue: unknown): unknown {
        return get(key, notFoundValue)(this.response || {});
    }

    getIn(path: string[], notFoundValue: unknown): unknown {
        return getIn(path, notFoundValue)(this.response || {});
    }

    //
    // Updating Methods

    update(updater: Function): Message<R, E> {
        return new Message(updater(this));
    }

    updateRequestState(updater: Function, messageProps?: MessageInput<R, E>): Message<R, E> {
        return new Message({
            ...this,
            ...(messageProps || {}),
            requestState: updater(this.requestState)
        });
    }

    //
    // empty

    static empty(messageProps: MessageInput<any, any>) {
        return new Message({
            ...messageProps,
            response: undefined,
            requestError: undefined,
            requestState: RequestState.empty()
        });
    }
    toEmpty(): Message<R, E> {
        return this.updateRequestState((_) => _.toEmpty(), {...this});
    }

    //
    // fetching

    static fetching<E>(messageProps: MessageInput<undefined, E>): Message<undefined, E> {
        return new Message({
            ...(messageProps || {}),
            response: undefined,
            requestState: RequestState.fetching()
        });
    }
    toFetching(): Message<R, E> {
        return this.updateRequestState((_) => _.toFetching(), {...this});
    }

    //
    // refetching

    static refetching<R, E>(messageProps: MessageInput<R, E>): Message<R, E> {
        return new Message({
            ...messageProps,
            requestState: RequestState.refetching()
        });
    }
    toRefetching(): Message<R, E> {
        return this.updateRequestState((_) => _.toRefetching(), {...this});
    }

    //
    // success

    static success<R, E>(messageProps: MessageInput<R, E>): Message<R, E> {
        return new Message({
            ...messageProps,
            requestState: RequestState.success()
        });
    }
    toSuccess(): Message<R, E> {
        return this.updateRequestState((_) => _.toSuccess(), {...this});
    }

    //
    // Error

    static error<R, E>(messageProps: MessageInput<R, E>): Message<R, E> {
        return new Message({
            ...messageProps,
            requestState: RequestState.error()
        });
    }
    toError(): Message<R, E> {
        return this.updateRequestState((_) => _.toError(), {...this});
    }
}
