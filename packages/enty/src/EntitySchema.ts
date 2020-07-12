import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {EntitySchemaOptions} from './util/definitions';
import {EntitySchemaInterface} from './util/definitions';
import {StructuralSchemaInterface} from './util/definitions';
import {IdAttribute} from './util/definitions';
import {Merge} from './util/definitions';

import {UndefinedIdError} from './util/Error';
import getIn from 'unmutable/lib/getIn';
import get from 'unmutable/lib/get';
import REMOVED_ENTITY from './util/RemovedEntity';
import ObjectSchema from './ObjectSchema';
import constructSchemaFromLiteral from './util/constructSchemaFromLiteral';

export default class EntitySchema<A extends StructuralSchemaInterface<any>>
    implements EntitySchemaInterface<A> {
    name: string;
    _shape: A;
    id: IdAttribute;
    merge: Merge | null | undefined;

    constructor(name: string, options: EntitySchemaOptions<any> = {}) {
        this.name = name;
        this.merge = options.merge;

        if (options.shape === null) {
            this.shape = null;
            this.id = options.id || ((data) => '' + data);
        } else {
            this.shape = options.shape || new ObjectSchema({});
            this.id = options.id || get('id');
        }
    }

    get shape(): any {
        return this._shape;
    }
    set shape(shape: any) {
        this._shape = constructSchemaFromLiteral(shape);
    }

    normalize(data: any, entities: Object = {}): NormalizeState {
        const {shape, name} = this;

        let id = this.id(data);
        let previousEntity;
        let schemas = {};
        let result;

        if (id == null) {
            throw UndefinedIdError(name, id);
        }
        id = id.toString();

        entities[name] = entities[name] || {};

        // only normalize if we have a defined shape
        if (shape == null) {
            result = data;
        } else {
            let _ = shape.normalize(data, entities);
            result = _.result;
            schemas = _.schemas;
            previousEntity = entities[name][id];
        }

        // list this schema as one that has been used
        schemas[name] = this;

        entities[name][id] = previousEntity
            ? (this.merge || shape.merge)(previousEntity, result)
            : result;

        return {
            entities,
            schemas,
            result: id
        };
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): any {
        const {result, entities} = denormalizeState;
        const {shape, name} = this;
        const entity = getIn([name, result])(entities);

        if (entity == null || entity === REMOVED_ENTITY || shape == null) {
            return entity;
        }

        return shape.denormalize({result: entity, entities}, path);
    }
}
