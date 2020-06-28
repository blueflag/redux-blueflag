import ObjectSchema from '../ObjectSchema';
import EntitySchema from '../EntitySchema';
import REMOVED_ENTITY from '../util/RemovedEntity';

var foo = new EntitySchema({
    name: 'foo',
    shape: new ObjectSchema({})
});

class Foo {
    first: string;
    last: string;
    name: string;
    constructor(data: {first: string; last: string}) {
        this.first = data.first;
        this.last = data.last;
    }
}

class FooSchema extends ObjectSchema<any> {
    create(aa: any) {
        return new Foo(aa);
    }
}

test('ObjectSchema can normalize objects', () => {
    const schema = new ObjectSchema({foo});
    let {entities, result} = schema.normalize({foo: {id: '1'}});

    expect(result).toEqual({foo: '1'});
    expect(entities.foo['1'].result).toEqual({id: '1'});
});

test('ObjectSchema.denormalize is the inverse of ObjectSchema.normalize', () => {
    const schema = new ObjectSchema({foo});
    const data = {foo: {id: '1'}};
    const output = schema.denormalize(schema.normalize(data));
    expect(data).toEqual(output);
});

test('ObjectSchema can normalize empty objects', () => {
    const schema = new ObjectSchema({foo});
    let {entities, result} = schema.normalize({bar: {}});

    expect(entities).toEqual({});
    expect(result).toEqual({bar: {}});
});

test('ObjectSchema can denormalize objects', () => {
    const schema = new ObjectSchema({foo});

    const entities = {foo: {'1': {normalizeTime: 0, result: {id: '1'}}}};

    expect(schema.denormalize({result: {foo: '1'}, entities})).toEqual({
        foo: {id: '1'}
    });
});

test('ObjectSchema will not denormalize null values', () => {
    const schema = new ObjectSchema({foo});

    const entities = {foo: {'1': {normalizeTime: 0, result: {id: '1'}}}};

    expect(schema.denormalize({result: null, entities})).toEqual(null);
});

test('ObjectSchema will not denormalize unknown keys', () => {
    const schema = new ObjectSchema({foo});

    const entities = {foo: {'1': {normalizeTime: 0, result: {id: '1'}}}};

    expect(schema.denormalize({result: {foo: '1', bar: '2'}, entities})).toEqual({
        foo: {id: '1'},
        bar: '2'
    });
});

test('ObjectSchema will filter out REMOVED_ENTITY keys', () => {
    const schema = new ObjectSchema({foo});

    const entities = {foo: {'1': {normalizeTime: 0, result: REMOVED_ENTITY}}};

    expect(schema.denormalize({result: {foo: '1'}, entities})).toEqual({});
});

test('ObjectSchema can denormalize objects without mutating', () => {
    const schema = new ObjectSchema({foo});
    const result = {foo: '1'};
    const originalResult = {...result};
    const entities = {foo: {'1': {normalizeTime: 0, result: {id: '1'}}}};

    schema.denormalize({result, entities});
    expect(result).toEqual(originalResult);
});

test('ObjectSchema will not mutate input objects', () => {
    const schema = new ObjectSchema({foo});
    const objectTest = {foo: {id: '1'}};

    schema.normalize(objectTest, {});
    expect(objectTest).toEqual({foo: {id: '1'}});
});

test('ObjectSchemas can create objects', () => {
    const schema = new FooSchema({});
    const state = schema.normalize({first: 'foo', last: 'bar'}, {});
    expect(state.result).toBeInstanceOf(Foo);
});

it('will not create extra keys if value is undefined', () => {
    const schema = new ObjectSchema({
        foo: new EntitySchema({name: 'foo'}),
        bar: new EntitySchema({name: 'bar'})
    });
    const state = schema.denormalize(schema.normalize({foo: {id: 'foo'}}, {}));

    expect(state).toHaveProperty('foo', {id: 'foo'});
    expect(state).not.toHaveProperty('bar');
});
