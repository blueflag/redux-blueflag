import {NormalizeState} from './util/definitions';
import {DenormalizeState} from './util/definitions';
import {ShapeSchema} from './util/definitions';
import {Entities} from './util/definitions';
import EntitySchema from './EntitySchema';

type DynamicShape<A> = (data: A) => ShapeSchema<any> | EntitySchema<any, A>;

export default class DynamicSchema<A> {
    shape: DynamicShape<A>;

    constructor(shape: DynamicShape<A>) {
        this.shape = shape;
    }

    normalize(data: A, entities: Entities = {}): NormalizeState {
        const schema = this.shape(data);
        const result = schema.normalize(data, entities);

        return {
            entities,
            schemas: result.schemas,
            result: {
                resultType: 'dynamicSchemaResult',
                result,
                schema
            }
        };
    }

    denormalize(denormalizeState: DenormalizeState, path: Array<any> = []): any {
        const {schema, result} = denormalizeState.result;
        return schema.denormalize(result, path);
    }
}
