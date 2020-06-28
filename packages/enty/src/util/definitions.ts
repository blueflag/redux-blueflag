import EntitySchema from '../EntitySchema';
import DynamicSchema from '../DynamicSchema';

export type Schemas = {[key: string]: Schema};
export type Entities = Record<
    string,
    Record<
        string,
        {
            normalizeTime: number;
            result: any;
        }
    >
>;

export type NormalizeState = {
    entities: Entities;
    result: any;
    schemas: Schemas;
};

export type DenormalizeState = {
    entities: Entities;
    result: any;
};

export type EntitySchemaOptions<Shape> = {
    name: string;
    shape?: Shape;
    id?: (entity: Object) => string;
};

//
// Options

export type Normalize = (data: unknown, entities: Entities) => NormalizeState;
export type Denormalize = (denormalizeState: DenormalizeState, path?: Array<unknown>) => any;
export type Id = (data: any) => string;

//
// Interfaces

export type Schema = ShapeSchema<any> | EntitySchema<any, any> | DynamicSchema<any>;

export interface ShapeSchema<Shape> {
    normalize: Normalize;
    denormalize: Denormalize;
    shape: Shape;
    create: Function;
    merge: Function;
}
