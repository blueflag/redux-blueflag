// @flow
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';

type Request = (payload: mixed) => any;
type RequestState = 'empty' | 'fetching' | 'refetching' | 'success' | 'error';

type MessageInput = {
    removeEntity: (type: string, id: string) => void,
    request: Request,
    requestError: any,
    requestState: RequestState,
    reset: () => void,
    response: any,
    responseKey: string,
    value?: any
};

export default class Message {
    // Data
    responseKey: string;
    requestError: any;

    // Methods
    response: any;
    request: Request;
    reset: () => void;
    removeEntity: (type: string, id: string) => void;

    // RequestState
    value: any;
    requestState: RequestState;
    isEmpty: boolean;
    isFetching: boolean;
    isRefetching: boolean;
    isSuccess: boolean;
    isError: boolean;

    constructor(props: MessageInput) {
        this.responseKey = props.responseKey;
        this.response = props.response;
        this.requestError = props.requestError;
        this.request = props.request;
        this.reset = props.reset;
        this.removeEntity = props.removeEntity;
        this.value = props.value;
        this.requestState = props.requestState || 'empty';

        // $FlowFixMe
        Object.defineProperties(this, {
            isEmpty: {enumerable: true, get: () => this.requestState === 'empty'},
            isFetching: {enumerable: true, get: () => this.requestState === 'fetching'},
            isRefetching: {enumerable: true, get: () => this.requestState === 'refetching'},
            isSuccess: {enumerable: true, get: () => this.requestState === 'success'},
            isError: {enumerable: true, get: () => this.requestState === 'error'}
        });
    }


    //
    // Response Getters

    get(key: string, notFoundValue: mixed): mixed {
        return get(key, notFoundValue)(this.response || {});
    }

    getIn(path: string[], notFoundValue: mixed): mixed {
        return getIn(path, notFoundValue)(this.response || {});
    }

    //
    // Updating Methods

    update(updater: Function): Message {
        return new Message(updater(this));
    }

    _createMap = (bool: string, create: Function) => {
        return (fn: Function) => {
            // $FlowFixMe
            if(this[bool]) {
                let value = fn(this.value, this);
                return value instanceof Message ? value : create({...this, value});
            }
            return this;
        };
    }


    //
    // State Functions

    static empty = (messageLike: mixed) => new Message({
        ...messageLike,
        response: undefined,
        requestError: undefined,
        requestState: 'empty'
    });
    emptyMap = this._createMap('isEmpty', Message.empty);
    toEmpty = () => Message.empty(this);

    static fetching = (messageLike: mixed) => new Message({
        ...messageLike,
        response: undefined,
        requestError: undefined,
        requestState: 'fetching'
    });
    fetchingMap = this._createMap('isFetching', Message.fetching);
    toFetching = () => Message.fetching(this);

    static refetching = (messageLike: mixed) => new Message({
        ...messageLike,
        requestState: 'refetching'
    });
    refetchingMap = this._createMap('isRefetching', Message.refetching);
    toRefetching = () => Message.refetching(this);

    static success = (messageLike: mixed) => new Message({
        ...messageLike,
        requestState: 'success'
    });
    successMap = this._createMap('isSuccess', Message.success);
    toSuccess = () => Message.success(this);

    static error = (messageLike: mixed) => new Message({
        ...messageLike,
        requestState: 'error'
    });
    errorMap = this._createMap('isError', Message.error);
    toError = () => Message.error(this);

}

