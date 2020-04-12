// @flow
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';

type Request = (payload: mixed) => any;

type MessageInput = {
    removeEntity: (type: string, id: string) => void,
    request: Request,
    requestError: any,
    reset: () => void,
    response: any,
    responseKey: string,
    isEmpty?: ?boolean,
    isFetching?: ?boolean,
    isRefetching?: ?boolean,
    isSuccess?: ?boolean,
    isError?: ?boolean,
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
    isEmpty: ?boolean;
    isFetching: ?boolean;
    isRefetching: ?boolean;
    isSuccess: ?boolean;
    isError: ?boolean;

    constructor(props: MessageInput) {
        this.responseKey = props.responseKey;
        this.response = props.response;
        this.requestError = props.requestError;
        this.request = props.request;
        this.reset = props.reset;
        this.removeEntity = props.removeEntity;
        this.value = props.value;

        const {isEmpty, isFetching, isRefetching, isSuccess, isError} = props;
        this.isEmpty = isEmpty;
        this.isFetching = isFetching;
        this.isRefetching = isRefetching;
        this.isSuccess = isSuccess;
        this.isError = isError;

        if(!isFetching && !isRefetching && !isSuccess && !isError) {
            this.isEmpty = true;
        }
    }


    //
    // Response Getters

    get(key: string, notFoundValue: mixed): mixed {
        return get(key, notFoundValue)(this.response || {});
    }

    getIn(path: string[], notFoundValue: mixed): mixed {
        return getIn(path, notFoundValue)(this.response || {});
    }

    get value() {
        return this.value;
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
        }
    }


    //
    // State Functions

    static empty = (messageLike: mixed) => new Message({
        ...messageLike,
        response: undefined,
        requestError: undefined,
        isEmpty: true
    });
    emptyMap = this._createMap('isEmpty', Message.empty);
    toEmpty = () => Message.empty(this);

    static fetching = (messageLike: mixed) => new Message({
        ...messageLike,
        response: undefined,
        requestError: undefined,
        isFetching: true
    });
    fetchingMap = this._createMap('isFetching', Message.fetching);
    toFetching = () => Message.fetching(this);

    static refetching = (messageLike: mixed) => new Message({
        ...messageLike,
        isRefetching: true
    });
    refetchingMap = this._createMap('isRefetching', Message.refetching);
    toRefetching = () => Message.refetching(this);

    static success = (messageLike: mixed) => new Message({
        ...messageLike,
        isSuccess: true
    });
    successMap = this._createMap('isSuccess', Message.success);
    toSuccess = () => Message.success(this);

    static error = (messageLike: mixed) => new Message({
        ...messageLike,
        isError: true
    });
    errorMap = this._createMap('isError', Message.error);
    toError = () => Message.error(this);

}

