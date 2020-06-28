import EntitySchema from '../EntitySchema';
import ArraySchema from '../ArraySchema';
import DynamicSchema from '../DynamicSchema';
import ObjectSchema from '../ObjectSchema';

const foo = new EntitySchema({name: 'foo'});
const bar = new EntitySchema({name: 'bar'});
const baz = new EntitySchema({name: 'baz'});

foo.shape = new ObjectSchema({});
baz.shape = new ObjectSchema({});
bar.shape = new ObjectSchema({});

const fooBarBaz = new DynamicSchema((data: {type: string}) => {
    switch (data.type) {
        case 'foo':
            return foo;
        case 'bar':
            return bar;
        case 'baz':
        default:
            return baz;
    }
});

test('DynamicSchema can choose an appropriate schema to normalize', () => {
    const unknownArray = new ArraySchema(fooBarBaz);
    const data = [
        {type: 'foo', id: '0'},
        {type: 'bar', id: '1'},
        {type: 'baz', id: '2'}
    ];
    const {entities} = unknownArray.normalize(data);

    expect(entities.foo['0'].result).toEqual(data[0]);
    expect(entities.bar['1'].result).toEqual(data[1]);
    expect(entities.baz['2'].result).toEqual(data[2]);
});

test('DynamicSchema.denormalize is the inverse of DynamicSchema.normalize', () => {
    const schema = new ArraySchema(fooBarBaz);
    const data = [
        {type: 'foo', id: '0'},
        {type: 'bar', id: '1'},
        {type: 'baz', id: '2'}
    ];
    const output = schema.denormalize(schema.normalize(data));
    expect(data).toEqual(output);
});

test('DynamicSchema.normalize', () => {
    const data = {type: 'foo', id: '0'};
    const output = fooBarBaz.denormalize(fooBarBaz.normalize(data));
    expect(data).toEqual(output);
});

test('DynamicSchema.normalize on to existing data', () => {
    const schema = new ArraySchema(fooBarBaz);

    const first = [{type: 'foo', id: '0'}];

    const second = [
        {type: 'bar', id: '1'},
        {type: 'baz', id: '2'}
    ];

    const {entities} = schema.normalize(first);
    const output = schema.normalize(second, entities);

    expect(output.entities.foo['0'].result).toEqual(first[0]);
    expect(output.entities.bar['1'].result).toEqual(second[0]);
    expect(output.entities.baz['2'].result).toEqual(second[1]);
});
