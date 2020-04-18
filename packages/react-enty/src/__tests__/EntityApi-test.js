// @flow
import React from 'react';
import EntityApi from '../EntityApi';
import {ObjectSchema} from 'enty';
import {useEffect} from 'react';
import {asyncUpdate, ExpectsMessage} from './RequestSuite';

describe('exports', () => {

    const api = EntityApi({
        foo: () => Promise.resolve(),
        bar: {
            baz: () => Promise.resolve()
        }
    }, new ObjectSchema({}));

    it('will export the api shape', () => {
        const requestHoc = expect.any(Function);
        const useRequest = expect.any(Function);
        const Provider = expect.any(Function);
        const ProviderHoc = expect.any(Function);

        expect(api).toMatchObject({
            Provider,
            ProviderHoc,
            foo: {
                requestHoc,
                useRequest
            },
            bar: {
                baz: {
                    requestHoc,
                    useRequest
                }
            }
        });
    });

});

describe('Provider', () => {

    it('will transparently stack providers', () => {
        const A = EntityApi({
            foo: () => Promise.resolve()
        }, new ObjectSchema({}));

        const B = EntityApi({
            foo: () => Promise.resolve()
        }, new ObjectSchema({}));
        const Child = () => null;

        expect(() => mount(<A.Provider>
            <B.Provider>
                <Child/>
            </B.Provider>
        </A.Provider>)).not.toThrow();
    });

});

it('can request and render without a schema', async () => {
    const {foo, Provider} = EntityApi({
        foo: () => Promise.resolve('FOO!')
    });

    const Child = () => {
        const message = foo.useRequest();
        useEffect(() => {
            message.request();
        }, []);
        return <ExpectsMessage message={message} />;
    };

    const wrapper = mount(<Provider><Child/></Provider>);
    expect(wrapper).toBeFetching();
    await asyncUpdate(wrapper);
    expect(wrapper).toBeSuccess('FOO!');
});

it('can log reducer cycles', async () => {
    const {foo, Provider} = EntityApi({
        foo: () => Promise.resolve('FOO!')
    });

    const Child = () => {
        const message = foo.useRequest();
        useEffect(() => {
            message.request();
        }, []);
        return <ExpectsMessage message={message} />;
    };

    const wrapper = mount(<Provider debug={true}><Child/></Provider>);
    expect(wrapper).toBeFetching();
    await asyncUpdate(wrapper);
    expect(wrapper).toBeSuccess('FOO!');
});

