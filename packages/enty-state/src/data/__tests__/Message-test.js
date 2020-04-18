// @flow
import Message from '../Message';

const response = {name: 'foo'};
const responseKey = 'FOO';
const request = async () => response;
const requestError = 'ERROR!';
const reset = () => {};
const removeEntity = () => {};

const messageInput = {response, responseKey, request, requestError, reset, removeEntity};

it('will let you set responseKey, response,, requestError, request', () => {
    const message = new Message({
        reset,
        responseKey: 'foo',
        response: 'bar',
        requestState: 'success',
        value: 'baz',
        requestError: 'qux',
        removeEntity,
        request: () => Promise.resolve('quux')
    });

    expect(message.responseKey).toBe('foo');
    expect(message.response).toBe('bar');
    expect(message.value).toBe('baz');
    expect(message.requestError).toBe('qux');
    expect(message.request()).resolves.toBe('quux');
});


it('will default to Empty', () => {
    expect(new Message({
        reset,
        removeEntity,
        response: null,
        responseKey: 'foo',
        request: Promise.resolve,
        requestError: null,
        requestState: 'empty'
    }).isEmpty).toBe(true);
});

it('will let you update the message', () => {
    const newMessage = Message.empty(messageInput)
        .update(message => ({
            ...message,
            response: 'bar'
        }));

    expect(newMessage.response).toBe('bar');
});

describe('Message response methods', () => {
    const message = Message.success({
        ...messageInput,
        response: {
            foo: 'bar',
            bar: {
                baz: 'qux'
            }
        }
    });

    it('will select a value from the response', () => {
        expect(message.get('foo')).toBe('bar');
        expect(message.getIn(['bar', 'baz'])).toBe('qux');
    });

    it('will use not found value if nothing is found', () => {
        expect(message.get('blah', '!')).toBe('!');
        expect(message.getIn(['bar', 'blah'], '!')).toBe('!');
    });

    it('will not break on empty responses', () => {
        expect(Message.empty(messageInput).get('blah', '!')).toBe('!');
        expect(Message.empty(messageInput).getIn(['bar', 'blah'], '!')).toBe('!');
    });

});

describe('Message methods', () => {

    it('will change with .to functions', () => {
        expect(Message.fetching().toEmpty().isEmpty).toBe(true);
        expect(Message.empty(messageInput).toFetching().isFetching).toBe(true);
        expect(Message.empty(messageInput).toRefetching().isRefetching).toBe(true);
        expect(Message.empty(messageInput).toSuccess().isSuccess).toBe(true);
        expect(Message.empty(messageInput).toError().isError).toBe(true);
    });

});

describe('Message Constructors', () => {
    test('Message.empty will create a empty message without a response', () => {
        const message = Message.empty(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.isEmpty).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.fetching will create a fetching message without a response', () => {
        const message = Message.fetching(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.isFetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.refetching will create a refetching message with a response', () => {
        const message = Message.refetching(messageInput);
        expect(message.response).toBe(response);
        expect(message.isRefetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.success will create a success message with a response', () => {
        const message = Message.success(messageInput);
        expect(message.response).toBe(response);
        expect(message.isSuccess).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.error will create a error message with requestError', () => {
        const message = Message.error(messageInput);
        expect(message.requestError).toBe(requestError);
        expect(message.isError).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    it('will not break if nothing is passed to each constructor', () => {
        expect(Message.empty).not.toThrow();
        expect(Message.fetching).not.toThrow();
        expect(Message.refetching).not.toThrow();
        expect(Message.success).not.toThrow();
        expect(Message.error).not.toThrow();
    });
});


describe('request states', () => {

    test('map functions will update values', () => {
        function value(state) {
            return state
                .emptyMap(() => 'empty')
                .fetchingMap(() => 'fetching')
                .refetchingMap(() => 'refetching')
                .errorMap(() => 'error')
                .successMap(() => 'success')
                .value;
        }
        expect(value(Message.empty())).toBe('empty');
        expect(value(Message.fetching())).toBe('fetching');
        expect(value(Message.refetching())).toBe('refetching');
        expect(value(Message.error())).toBe('error');
        expect(value(Message.success())).toBe('success');
    });

    test('map functions can be used to update message state', () => {
        const {empty, fetching, refetching, success, error} = Message;
        const toSuccess = (_, mm) => mm.toSuccess();

        // empty)
        expect(empty({value: 'foo'}).emptyMap(toSuccess).isSuccess).toBe(true);
        expect(empty({value: 'foo'}).emptyMap(toSuccess).value).toBe('foo');

        // fetching
        expect(fetching({value: 'foo'}).fetchingMap(toSuccess).isSuccess).toBe(true);
        expect(fetching({value: 'foo'}).fetchingMap(toSuccess).value).toBe('foo');

        // refetching
        expect(refetching({value: 'foo'}).refetchingMap(toSuccess).isSuccess).toBe(true);
        expect(refetching({value: 'foo'}).refetchingMap(toSuccess).value).toBe('foo');

        // success
        expect(success({value: 'foo'}).successMap(toSuccess).isSuccess).toBe(true);
        expect(success({value: 'foo'}).successMap(toSuccess).value).toBe('foo');

        // error
        expect(error({value: 'foo'}).errorMap(toSuccess).isSuccess).toBe(true);
        expect(error({value: 'foo'}).errorMap(toSuccess).value).toBe('foo');
    });

    it('will return the value or defaultValue from .value', () => {
        expect(Message.error({value: 'foo'}).value).toBe('foo');
        expect(Message.error({value: 'foo'}).value || 'bar').toBe('foo');
        expect(Message.error().value || 'bar').toBe('bar');
    });

    it('will cast requestState via .to functions', () => {
        expect(Message.fetching().toEmpty().isEmpty).toBe(true);
        expect(Message.empty().toFetching().isFetching).toBe(true);
        expect(Message.empty().toRefetching().isRefetching).toBe(true);
        expect(Message.empty().toSuccess().isSuccess).toBe(true);
        expect(Message.empty().toError().isError).toBe(true);
    });

    test('variant apis', () => {

        function instance(state) {
            expect(state).toHaveProperty('value');
            expect(state).toHaveProperty('isEmpty');
            expect(state).toHaveProperty('isFetching');
            expect(state).toHaveProperty('isRefetching');
            expect(state).toHaveProperty('isSuccess');
            expect(state).toHaveProperty('isError');
            expect(state).toHaveProperty('emptyMap');
            expect(state).toHaveProperty('fetchingMap');
            expect(state).toHaveProperty('refetchingMap');
            expect(state).toHaveProperty('errorMap');
            expect(state).toHaveProperty('successMap');
        }

        // Instance
        instance(Message.empty());
        instance(Message.fetching());
        instance(Message.refetching());
        instance(Message.error());
        instance(Message.success());

        // Static
        expect(Message).toHaveProperty('empty');
        expect(Message).toHaveProperty('fetching');
        expect(Message).toHaveProperty('refetching');
        expect(Message).toHaveProperty('error');
        expect(Message).toHaveProperty('success');
    });

    it('can have its getters destructured', () => {
        const {isFetching, isSuccess} = Message.success();
        expect(isFetching).toBe(false);
        expect(isSuccess).toBe(true);
    });
});
