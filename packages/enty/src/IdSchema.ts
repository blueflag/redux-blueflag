import {NormalizeState} from './util/definitions';
import {Entities} from './util/definitions';
import EntitySchema from './EntitySchema';

/**
 * IdSchema
 */
export default class IdSchema extends EntitySchema<any, any> {
    normalize(data: any, entities: Entities = {}): NormalizeState {
        const {result, schemas} = super.normalize({id: data}, entities);
        return {result, schemas, entities};
    }
}
