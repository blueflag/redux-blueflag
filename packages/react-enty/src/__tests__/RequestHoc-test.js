// @flow
import React, {useEffect} from 'react';
import composeWith from'unmutable/composeWith';
import Message from 'enty-state/lib/data/Message';

import {fetchOnLoad} from './RequestSuite';
import {errorOnLoad} from './RequestSuite';
import {nothing} from './RequestSuite';
import {refetch} from './RequestSuite';
import {exisitingKey} from './RequestSuite';
import {fetchOnPropChange} from './RequestSuite';
import {fetchOnCallback} from './RequestSuite';
import {fetchSeries} from './RequestSuite';
import {fetchParallel} from './RequestSuite';
import {foo} from './RequestSuite';
import {baz} from './RequestSuite';
import {fooError} from './RequestSuite';
import {mountWithProvider} from './RequestSuite';
import {asyncUpdate} from './RequestSuite';


describe('config', () => {

    it('will return a function', () => {
        expect(typeof foo.requestHoc({name: 'foo'})).toBe('function');
    });

    describe('config.name and message', () => {

        test('will throw an error if config.name is not supplied', () => {
            expect(() => foo.requestHoc({})).toThrow('requestHoc must be given a name');
        });

        it('will give a Message to props.[name]', () => {
            expect.assertions(1);
            mountWithProvider(() => composeWith(
                foo.requestHoc({name: 'bar'}),
                (props) => {
                    expect(props.bar).toBeInstanceOf(Message);
                    return null;
                }
            ));
        });

    });

    describe('config.auto', () => {

        it('will fetch if any auto prop path changes', async () => {
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: ['foo', 'bar.baz'],
                payloadCreator: () => '!!!'
            }));


            expect(wrapper).toBeFetching();
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});

            // props.foo
            wrapper.setProps({foo: '!'}).update();
            expect(wrapper).toBeRefetching({data: '!!!'});
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});

            // props.bar.baz
            wrapper.setProps({bar: {baz: '!'}}).update();
            expect(wrapper).toBeRefetching({data: '!!!'});
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});
        });

        it('will do deep checks and not update', async () => {
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: ['foo', 'bar'],
                payloadCreator: () => '!!!'
            }));


            expect(wrapper).toBeFetching();
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});

            // props.foo
            wrapper.setProps({foo: '!'}).update();
            expect(wrapper).toBeRefetching({data: '!!!'});
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});

            // props.bar.baz
            wrapper.setProps({bar: {baz: '!'}}).update();
            expect(wrapper).toBeRefetching({data: '!!!'});
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});

            // props.bar.baz
            wrapper.setProps({bar: {baz: '!'}}).update();
            expect(wrapper).toBeSuccess({data: '!!!'});
        });


    });

    describe('config.shouldComponentAutoRequest', () => {

        it('will not request if shouldComponentAutoRequest returns false', () => {
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: true,
                shouldComponentAutoRequest: () => false
            }));

            expect(wrapper).not.toBeFetching();
            expect(wrapper).toBeEmpty();
        });

        it('will call shouldComponentAutoRequest with props', () => {
            let shouldComponentAutoRequest = jest.fn();
            mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: true,
                shouldComponentAutoRequest
            }), {foo: 'bar'});

            expect(shouldComponentAutoRequest).toHaveBeenCalledWith({foo: 'bar'});
        });

    });

    describe('config.payloadCreator', () => {

        test('config.payloadCreator will default to an identity if config.auto is falsy', async () => {
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message'
            }), {payload: '!!!'});

            wrapper.find('.request').simulate('click');
            expect(wrapper).toBeFetching();
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: '!!!'});
        });

        test('config.payloadCreator will by default return an empty object if config.auto is truthy', async () => {
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: true
            }));
            expect(wrapper).toBeFetching();
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: 'foo'});
        });

        test('config.payloadCreator will create the payload', async () => {
            expect.hasAssertions();
            let wrapper = mountWithProvider(foo.requestHoc({
                name: 'message',
                auto: true,
                payloadCreator: () => 'blah!'
            }));
            expect(wrapper).toBeFetching();
            await asyncUpdate(wrapper);
            expect(wrapper).toBeSuccess({data: 'blah!'});
        });

        it('will pass .request() payload through payloadCreator', async () => {
            const payloadCreator = jest.fn();
            await fetchOnCallback(foo.requestHoc({
                name: 'message',
                payloadCreator
            }));
            expect(payloadCreator).toHaveBeenCalled();
        });

    });

});


describe('usage', () => {

    it('can fetch on load', async () => {
        return fetchOnLoad(foo.requestHoc({
            name: 'message',
            payloadCreator: () => 'foo',
            auto: true
        }));
    });

    it('can catch rejected requests', async () => {
        return errorOnLoad(fooError.requestHoc({
            name: 'message',
            payloadCreator: () => 'foo',
            auto: true
        }));
    });

    it('can do nothing', async () => {
        return nothing(foo.requestHoc({
            name: 'message'
        }));
    });

    it('can refetch content', async () => {
        return refetch(foo.requestHoc({
            name: 'message'
        }));
    });

    it('can use an exising key', async () => {
        return exisitingKey(baz.requestHoc({
            name: 'message',
            key: (props) => {
                expect(props).toEqual({});
                return 'baz';
            }
        }));
    });

    it('can fetch if props change', async () => {
        return fetchOnPropChange(foo.requestHoc({
            name: 'message',
            payloadCreator: ({id}) => id,
            auto: ['id']
        }));
    });

    it('can fetch from a callback', async () => {
        return fetchOnCallback(foo.requestHoc({
            name: 'message'
        }));
    });

    it('can fetch multiples in series', async () => {
        return fetchSeries((ExpectsMessage) => {
            return composeWith(
                foo.requestHoc({name: 'aa'}),
                foo.requestHoc({name: 'bb'}),
                (props) => {
                    const {aa, bb} = props;

                    useEffect(() => {
                        if(aa.isEmpty) {
                            aa.request('first');
                        }
                        if(aa.isSuccess) {
                            bb.request('second');
                        }
                    }, [aa.requestState]);

                    return <div>
                        <ExpectsMessage message={aa} />
                        <ExpectsMessage message={bb} />
                    </div>;
                }
            );
        });
    });

    it('can fetch multiples in parallel', async () => {
        return fetchParallel((ExpectsMessage) => {
            return composeWith(
                foo.requestHoc({name: 'aa', auto: true, payloadCreator: () => 'first'}),
                foo.requestHoc({name: 'bb', auto: true, payloadCreator: () => 'second'}),
                (props) => {
                    const {aa, bb} = props;
                    return <div>
                        <ExpectsMessage message={aa} />
                        <ExpectsMessage message={bb} />
                    </div>;
                }
            );
        });
    });


});
