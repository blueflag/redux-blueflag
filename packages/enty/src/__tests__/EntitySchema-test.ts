import EntitySchema from '../EntitySchema';
import ObjectSchema from '../ObjectSchema';
import {UndefinedIdError} from '../util/Error';

const foo = new EntitySchema({name: 'foo'});
const bar = new EntitySchema({name: 'bar'});
const baz = new EntitySchema({name: 'baz'});

foo.shape = new ObjectSchema({});
baz.shape = new ObjectSchema({bar});
bar.shape = new ObjectSchema({foo});

describe('configuration', () => {
    it('can mutate its shape', () => {
        var schema = new EntitySchema({name: 'foo'});
        const shape = new ObjectSchema({});
        schema.shape = shape;
        expect(schema.shape).toBe(shape);
    });

    it('will default to a ObjectSchema shape', () => {
        let schemaB = new EntitySchema({name: 'foo'});
        expect(schemaB.shape).toBeInstanceOf(ObjectSchema);
    });
});

describe('EntitySchema.normalize', () => {
    it('can normalize entities', () => {
        const {entities, result} = foo.normalize({id: '1'});
        expect(result).toBe('1');
        expect(entities.foo['1'].result).toEqual({id: '1'});
    });

    it('will not mutate input objects', () => {
        const entityTest = {id: '1'};
        foo.normalize(entityTest, {});
        expect(entityTest).toEqual({id: '1'});
    });

    it('will collect schemas that were used', () => {
        const entityTest = {id: '1', bar: {id: '2', foo: {id: '3'}}};
        expect(Object.keys(baz.normalize(entityTest, {}).schemas)).toEqual(['foo', 'bar', 'baz']);
    });

    it('will throw an error if an entity doesnt have and id', () => {
        const schema = new EntitySchema({
            name: 'foo',
            shape: new ObjectSchema({})
        });
        expect(() => schema.normalize({}, {})).toThrow(UndefinedIdError('foo'));
    });

    it('will call merge on definition when an entity already exists', () => {
        const merge = jest.fn();
        const entities = {foo: {a: {normalizeTime: 0, result: {id: 'a', name: 'first'}}}};
        class MockMerge extends ObjectSchema<any> {
            merge = merge;
        }
        const schema = new EntitySchema({
            name: 'foo',
            shape: new MockMerge({})
        });

        schema.normalize({id: 'a', name: 'second'}, entities);
        expect(merge).toHaveBeenCalledWith({id: 'a', name: 'first'}, {id: 'a', name: 'second'});
    });

    it('will not try to normalize null shapes', () => {
        const schema = new EntitySchema({
            name: 'foo',
            shape: null
        });
        const data = {id: 'id'};
        expect(schema.normalize(data, {}).entities.foo.id.result).toEqual(data);
    });
});

describe('EntitySchema.denormalize', () => {
    it('can denormalize entities', () => {
        const entities = {
            foo: {
                '1': {normalizeTime: 0, result: {id: '1'}}
            }
        };

        expect(foo.denormalize({result: '1', entities})).toEqual({id: '1'});
    });

    it('will not cause an infinite recursion', () => {
        const foo = new EntitySchema({name: 'foo'});
        const bar = new EntitySchema({name: 'bar'});

        foo.shape = new ObjectSchema({bar});
        bar.shape = new ObjectSchema({foo});

        const entities = {
            bar: {'1': {normalizeTime: 0, result: {id: '1', foo: '1'}}},
            foo: {'1': {normalizeTime: 0, result: {id: '1', bar: '1'}}}
        };

        expect(bar.denormalize({result: '1', entities})).toEqual({
            id: '1',
            foo: {
                id: '1',
                bar: {
                    id: '1',
                    foo: '1'
                }
            }
        });
    });

    it('will not denormalize null entities', () => {
        const entities = {
            bar: {'1': {normalizeTime: 0, result: {id: '1', foo: null}}}
        };

        expect(bar.denormalize({result: '2', entities})).toEqual(undefined);
    });
});
