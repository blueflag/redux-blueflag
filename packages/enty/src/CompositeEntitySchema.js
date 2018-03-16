// @flow
import {getIn} from 'stampy/lib/util/CollectionUtils';
import {CompositeDefinitionMustBeEntityError} from './util/Error';
import {CompositeKeysMustBeEntitiesError} from './util/Error';
import {NoDefinitionError} from './util/Error';
import Child from './abstract/Child';
import NullSchema from './NullSchema';

import type {Schema} from './util/definitions';
import type {Entity} from './util/definitions';
import type {NormalizeState} from './util/definitions';
import type {DenormalizeState} from './util/definitions';

type CompositeInput = {
    definition: Object,
    compositeKeys: *
};

export class CompositeEntitySchema extends Child implements Schema<Entity> {
    type: string;
    options: Entity;
    compositeKeys: Object;
    definition: Schema<Entity>;
    /**
     * CompositeEntitySchema
     */
    constructor(
        name: string,
        {
            definition = new NullSchema(),
            compositeKeys = {},
            ...options
        }: CompositeInput = {}
    ) {
        super(definition);
        this.type = 'entity';
        this.compositeKeys = compositeKeys;

        this.options = {
            name,
            idAttribute: () => {},
            ...options
        };
    }

    /**
     * CompositeEntitySchema.normalize
     */
    normalize(data: Object, entities: Object = {}): NormalizeState {
        const {definition, compositeKeys} = this;
        const {name} = this.options;

        const adjustedData = Object.assign({}, data);

        let idList = [];

        if(!definition) {
            throw NoDefinitionError(name);
        }

        if(definition.type !== 'entity') {
            throw CompositeDefinitionMustBeEntityError(name, definition.constructor.name);
        }

        const compositeResults = Object.keys(this.compositeKeys)
            .reduce((rr: Object, key: string): Object => {
                if(compositeKeys[key].type !== 'entity') {
                    throw CompositeKeysMustBeEntitiesError(`${name}.${key}`, compositeKeys[key].type);
                }

                const {result: compositeResult} = compositeKeys[key].normalize(adjustedData[key], entities);

                rr[key] = compositeResult;
                idList.push(compositeResult);
                delete adjustedData[key];
                return rr;
            }, Object.assign({}, this.compositeKeys));



        // recurse into the main definition
        let {schemas, result: mainResult} = definition.normalize(adjustedData, entities);

        const result = {
            [definition.options.name]: mainResult,
            ...compositeResults
        };

        const id = [mainResult]
            .concat(idList)
            .join('-')
        ;

        entities[name] = entities[name] || {};
        entities[name][id] = result;


        // Save the schema
        schemas[name] = this;

        return {
            entities,
            schemas,
            result: id
        };
    }

    /**
     * CompositeEntitySchema.denormalize
     */
    denormalize(denormalizeState: DenormalizeState, path: Array<*> = []): any {
        const {definition, compositeKeys} = this;
        const {name} = this.options;
        const {result, entities} = denormalizeState;

        const entity = getIn(entities, [name, result]);

        const mainDenormalizedState = definition.denormalize({result: entity[definition.options.name], entities}, path);



        const compositeDenormalizedState = Object.keys(compositeKeys)
            .reduce((rr: Object, key: string): Object => {
                rr[key] = compositeKeys[key].denormalize({result: entity[key], entities}, path);
                return rr;
            }, Object.assign({}, this.compositeKeys));

        return definition.definition.options.merge(mainDenormalizedState, compositeDenormalizedState);
    }
}

export default function CompositeEntitySchemaFactory(...args: any[]): CompositeEntitySchema {
    return new CompositeEntitySchema(...args);
}
