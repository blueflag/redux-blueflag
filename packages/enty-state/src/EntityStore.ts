import {EntitySchema, Entities, Schema, Schemas, ObjectSchema, REMOVED_ENTITY} from 'enty';
import createRequestAction from './createRequestAction';

type RequestState = 'empty' | 'fetching' | 'refetching' | 'success' | 'error';
type AsyncState = 'pending' | 'success' | 'error';

type Options<A> = {
    schema?: Schema;
    api: A;
};

type Requests = {
    [key: string]: {
        state: RequestState;
        result: any;
        error: any;
    };
};

export type ApiRequest = {
    raw: Function;
    path: string;
    request: <A>(payload: A, meta: {key: string}) => void;
};

export default class EntityStore<A> {
    _callback: Array<Function>;
    _normalizeCount: number;
    _entity: Entities;
    _request: Requests;
    _api: any;
    _rootSchema: Schema;
    _schema: Schemas;

    constructor(options: Options<A>) {
        let schema = options.schema || new ObjectSchema({});
        schema.shape.request = new EntitySchema({name: 'request'});
        this._callback = [];
        this._entity = {};
        this._request = {};
        this._schema = {};
        this._normalizeCount = 0;
        this._rootSchema = schema;
        this._api = this._recurseApi(options.api, '');
    }

    //
    //
    // Private Methods
    // ===============

    _recurseApi(branch: unknown, path: string) {
        return Object.keys(branch).reduce((reduction: any, key: string): any => {
            const item = branch[key];
            const nextPath = path.concat(key);
            if (typeof item === 'function') {
                reduction[key] = {
                    path: nextPath,
                    raw: item,
                    request: createRequestAction(this, item)
                };
            } else {
                reduction[key] = this._recurseApi(item, nextPath);
            }
            return reduction;
        }, {});
    }

    // Normalize a payload against the root schema
    _normalizePayload(payload: any) {
        const {entities, result, schemas} = this._rootSchema.normalize(payload, this._entity);
        this._entity = entities;
        this._schema = schemas;
        return result;
    }
    _denormalize(result: any) {
        return this._rootSchema.denormalize({entities: this._entity, result});
    }

    // Call all callbacks to notify them of a change to the store.
    // Methods that mutate the store must also call this
    _notifiy() {
        this._normalizeCount += 1;
        this._callback.forEach((fn) => fn(this));
    }

    //
    //
    // Public Methods
    // ==============

    // normalize a payload and notify all callbacks
    update(payload: Object) {
        this._normalizePayload(payload);
        this._notifiy();
    }

    // given a request key and a new state and a payload
    // 1. update the request to its new state
    // 2. normalize payloads
    // 3. notify callbacks
    updateRequest(key: string, type: AsyncState, payload: Object) {
        this._request[key] = this._request[key] || {
            state: 'empty',
            error: undefined,
            result: undefined
        };
        const {result} = this._request[key];
        switch (type) {
            case 'pending':
                this._request[key].state = result ? 'refetching' : 'fetching';
                break;

            case 'success':
                this._request[key].state = type;
                this._request[key].result = this._normalizePayload(payload);
                break;

            case 'error':
                this._request[key].state = type;
                this._request[key].error = payload;
                break;
        }
        this._notifiy();
    }

    // Replace an entity with the removed entity sentinel
    removeEntity(type: string, id: string) {
        if (this._entity[type]?.[id]) {
            this._entity[type][id] = REMOVED_ENTITY;
        }
        this._notifiy();
    }

    // reset a request back to an empty state
    removeRequest(key: string) {
        this._request[key] = {state: 'empty', result: undefined, error: undefined};
        this._notifiy();
    }

    // Denormalize an entity out of state
    getEntity(type: string, id: string) {
        return this._schema[type]?.denormalize({
            result: id,
            entities: this._entity
        });
    }

    // Check if an entity is in state
    hasEntity(type: string, id: string) {
        return !!this._entity[type]?.[id];
    }

    // Denormalize a request object out of state
    getRequest(responseKey: string) {
        const {state, error, result} = this._request[responseKey] || {};
        return {
            state: state || 'empty',
            error,
            response: this._denormalize(result)
        };
    }

    // Check if a request exists
    hasRequest(key: string) {
        return key in this._request;
    }

    // Register a callback to be notified of changes
    subscribe(callback: Function) {
        this._callback.push(callback);
    }

    // Public api access
    get api() {
        return this._api;
    }

    get normalizeCount() {
        return this._normalizeCount;
    }
}
