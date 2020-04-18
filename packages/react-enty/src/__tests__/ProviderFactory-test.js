// @flow
import React from 'react';
import ProviderFactory from '../ProviderFactory';
import composeWith from 'unmutable/composeWith';

const expectContext = (testFn) => {
    const ExpectsContext = () => null;
    const Component = testFn(ExpectsContext);
    return expect(mount(<Component />).find('ExpectsContext').prop('context'));

};


describe('Factory', () => {

    it('returns a hock, component and context', () => {

        expect(ProviderFactory({reducer: aa => aa})).toMatchObject({
            Provider: expect.any(Function),
            ProviderHoc: expect.any(Function),
            Context: expect.any(Object)
        });

    });

});

describe('Component', () => {
    it('applies the intial state to a context', () => {
        const {Provider, Context} = ProviderFactory({});

        expectContext((Child) => () => {
            return <Provider initialState={{entities: {foo: 'component'}}}>
                <Context.Consumer
                    children={(context) => <Child context={context}/>}
                />
            </Provider>;
        }).toMatchObject([{
            baseSchema: undefined,
            entities: {foo: 'component'},
            request: {},
            schemas: {},
            stats: {responseCount: 0}
        }, expect.any(Function)]);

    });
});

describe('Hoc', () => {

    it('returns a config => component => props function', () => {
        const {ProviderHoc, Context} = ProviderFactory({});

        expectContext((Child) => composeWith(
            (Component) => (props) => <Component {...props} initialState={{entities: {foo: 'hoc'}}} />,
            ProviderHoc(),
            () => {
                return <Context.Consumer
                    children={(context) => <Child context={context}/>}
                />;
            }
        )).toMatchObject([{
            baseSchema: undefined,
            entities: {foo: 'hoc'},
            request: {},
            schemas: {},
            stats: {responseCount: 0}
        }, expect.any(Function)]);


    });

});

describe('Debugging', () => {

    it('will log reducer state if debug prop is provided', () => {
        const group = jest.spyOn(console, 'group').mockImplementation(() => {});
        const groupEnd = jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
        const {Provider} = ProviderFactory({});
        mount(<Provider debug="Foo" />);

        expect(group).toHaveBeenCalled();
        expect(groupEnd).toHaveBeenCalled();

        group.mockRestore();
        groupEnd.mockRestore();
    });


});
