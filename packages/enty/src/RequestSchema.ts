import {Schema, DenormalizeState} from './util/definitions';
import REMOVED_ENTITY from './util/RemovedEntity';
import ObjectSchema from './ObjectSchema';
import EntitySchema from './EntitySchema';

type RequestShape = {
    timestamp: number;
    state: 'pending' | 'success' | 'error';
    error: Error | null;
    response: any;
};

type RequestSchemaConfig = {
    name: string;
    request: Schema;
    error: Schema;
};

export default class RequestSchema extends EntitySchema<any> {

    constructor(options: RequestSchemaConfig) {
        super({
            name: options.name,
            shape: new ObjectSchema({
                request: options.request,
                error: options.error
            })
        });
    }

    create(data: RequestShape): RequestShape {
        return {
            timestamp: Date.now(),
            ...data
        };
    }

    merge(previous: RequestShape, next: RequestShape): RequestShape {
        let state = 'pending';
        if ('response' in next) state = 'success';
        if ('error' in next) state = 'error';
        return {
            ...previous,
            ...next,
            state,
            timestamp: Date.now()
        };
    }

    denormalize(denormalizeState: DenormalizeState, path: string[]) {
        return new RequestData(super.denormalize(denormalizeState, path));
    }
}


const fooList = new RequestSchema({response: fooList, error});



function(request, id, payload) {
    Store.update({fooListRequest: {id}});
    request(payload, {id})
        .then(response => Store.update({fooListRequest: {id, response}}))
        .catch(error => Store.update({fooListRequest: {id, error}}))

}

new Store({
    schema: RootSchema,
    get: (store, {name, id, meta}) => {
        switch(name) {
            case 'foo':
            case 'fooUpdate':
                store.requestPromise(id, () => fooRequester(meta))
                return store.get(name, id);
        }
    }
})



Store.get({name: 'foo', id: 'bar', meta: payload})



function Foo() {
    const {id} = props;
    const [foo, requestFoo] = useStore({name: 'foo', id});
    const [, requestFooUpdate] = useStore({name: 'fooUpdate', id});

    useEffect(() => {
        requestFoo({id});
    }, [id]);

}
