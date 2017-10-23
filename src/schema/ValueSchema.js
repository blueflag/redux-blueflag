// @flow
import type {NormalizeState} from '../definitions';

/**
 * @module Schema
 */

/**
 * ValueSchema
 *
 * @memberof module:Schema
 */
export class ValueSchema {
    type: string;
    options: Object;
    constructor(definition: Function, options: Object = {}) {
        this.type = 'dynamic';
        this.options = {
            definition,
            constructor: item => ({id: item}),
            ...options
        };
    }

    /**
     * ValueSchema.define
     */
    define(definition: any): ValueSchema {
        this.options.definition = definition;
        return this;
    }

    /**
     * ValueSchema.normalize
     */
    normalize(data: Object, entities: Object = {}): NormalizeState {
        const {definition, constructor} = this.options;
        const {result} = definition.normalize(constructor(data), entities);

        return {
            result,
            entities
        };
    }

    /**
     * ValueSchema.denormalize
     */
    denormalize(normalizeState: NormalizeState, path: Array<*> = []): any {
        return this.options.definition.denormalize(normalizeState, path);
    }
}

export default function ValueSchemaFactory(...args: any[]): ValueSchema {
    return new ValueSchema(...args);
}