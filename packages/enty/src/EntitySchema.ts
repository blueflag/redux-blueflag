import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {EntitySchemaOptions} from './util/definitions';
import {ShapeSchema} from './util/definitions';
import {Id} from './util/definitions';
import {Entities} from './util/definitions';

import {UndefinedIdError} from './util/Error';
import REMOVED_ENTITY from './util/RemovedEntity';
import ObjectSchema from './ObjectSchema';

export default class EntitySchema<Shape extends ShapeSchema<any>, Data> {
    name: string;
    shape: Shape | ObjectSchema<any>;
    id: Id;

    constructor(options: EntitySchemaOptions<Shape>) {
        this.name = options.name;
        this.shape = 'shape' in options ? options.shape : new ObjectSchema({});
        this.id = options.id || ((data) => data.id);
    }

    normalize(data: Data, entities: Entities = {}): NormalizeState {
        let id = this.id(data);
        let previousEntity: unknown;
        let schemas = {};
        let result: unknown;

        if (id == null) {
            throw UndefinedIdError(this.name, id);
        }
        id = id.toString();

        entities[this.name] = entities[this.name] || {};

        // only normalize if we have a defined shape
        if (this.shape == null) {
            result = data;
        } else {
            let _ = this.shape.normalize(data, entities);
            result = _.result;
            schemas = _.schemas;
            previousEntity = entities[this.name][id]?.result;
        }

        // list this schema as one that has been used
        schemas[this.name] = this;

        const normalizeTime = Date.now();

        entities[this.name][id] = entities[this.name][id] || {normalizeTime, result: null};
        entities[this.name][id].normalizeTime = normalizeTime;
        entities[this.name][id].result = previousEntity
            ? this.shape.merge(previousEntity, result)
            : result;

        return {
            entities,
            schemas,
            result: id
        };
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): Data {
        const {result, entities} = denormalizeState;
        const {shape, name} = this;
        const entity = entities[name]?.[result]?.result;

        if (entity == null || entity === REMOVED_ENTITY || shape == null) {
            return entity;
        }

        return shape.denormalize({result: entity, entities}, path);
    }
}
