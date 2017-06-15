// @flow
import {DELETED_ENTITY} from './SchemaConstant';

export class ObjectSchema {
    type: string;
    childSchema: Object;
    options: Object;
    constructor(childSchema: Object, options: Object = {}) {
        this.type = 'object';
        this.childSchema = childSchema;
        this.options = {
            denormalizeFilter: () => true,
            ...options
        };
    }
    normalize(data: Object, entities: Object = {}) {
        const {childSchema} = this;

        const result = Object.keys(data)
            .reduce((result, key) => {
                if(childSchema[key] && data[key]) {
                    result[key] = childSchema[key].normalize(data[key], entities).result;
                }

                return result;
            }, Object.assign({}, data));

        return {entities, result};
    }
    denormalize(result: Object, entities: Object, path: string[] = []) {
        const {childSchema, options} = this;
        let deletedKeys = [];

        if(result == null) {
            return result;
        }

        // Map denormalize to the values of result, but only
        // if they have a corresponding schema. Otherwise return the plain value.
        // Then filter out deleted keys, keeping track of ones deleted
        // Then Pump the filtered object through `denormalizeFilter`
        //
        // Lots of `item.keySeq().reduce(() => {}, item) because Immutable can't map records without
        // mutating them...
        return result
            .update((item) => {
                return item.keySeq()
                    .reduce((newItem, key) => {
                        var value = newItem.get(key);
                        var newValue;

                        if(path.indexOf(key) !== -1) {
                            newValue = value;
                        } else if(childSchema[key]) {
                            newValue = childSchema[key].denormalize(value, entities, path.concat(key));
                        } else {
                            newValue = value;
                        }

                        return newItem.set(key, newValue);
                    }, item);
            })
            .update((item) => {
                return item.keySeq()
                    .filter(key => item.get(key) === DELETED_ENTITY)
                    .reduce((newItem, deleteKey) => {
                        deletedKeys.push(deleteKey);
                        return newItem.delete(deleteKey);
                    }, item);
            })
            .update(ii => {
                return options.denormalizeFilter(ii, deletedKeys) ? ii : DELETED_ENTITY;
            });
    }
    merge(objectSchema: Object): ObjectSchema {
        return new ObjectSchema(
            Object.assign({}, this.childSchema, objectSchema.childSchema),
            Object.assign({}, this.options, objectSchema.options)
        );
    }
}

export default function ObjectSchemaFactory(...args: any[]): ObjectSchema {
    return new ObjectSchema(...args);
}
