// @flow
import Message from '../Message';
import RequestState from '../../data/RequestState';

const response = {name: 'foo'};
const responseKey = 'FOO';
const onRequest = async () => response;
const requestError = 'ERROR!';

const messageInput = {response, responseKey, onRequest, requestError};

it('will let you set responseKey, response, requestState, requestError, onRequest', () => {
    const message = new Message({
        responseKey: 'foo',
        response: 'bar',
        requestState: RequestState.success('baz'),
        requestError: 'qux',
        onRequest: () => Promise.resolve('quux')
    });

    expect(message.responseKey).toBe('foo');
    expect(message.response).toBe('bar');
    expect(message.requestState.value()).toBe('baz');
    expect(message.requestError).toBe('qux');
    expect(message.onRequest()).resolves.toBe('quux');
});


it('will default requestState to Empty', () => {
    expect(new Message({response: null, responseKey: 'foo', onRequest: Promise.resolve, requestError: null}).requestState.isEmpty).toBe(true);
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
        foo: 'bar',
        bar: {
            baz: 'qux'
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

describe('Message requestState methods', () => {
    const message = Message.success({foo: 'foo'});

    test('Message.updateRequestState can replace the requestState', () => {
        const errorMessage = message.updateRequestState(RequestState.error);
        expect(errorMessage.requestState.isError).toBe(true);
    });

    test('Message.updateRequestState is given the current requestState', () => {
        const errorMessage = message
            .updateRequestState(requestState => requestState.successFlatMap(RequestState.error));

        expect(errorMessage.requestState.isError).toBe(true);
        expect(errorMessage.requestState.isSuccess).not.toBe(true);
    });

    it('will change requestState with .to functions', () => {
        expect(Message.fetching().toEmpty().requestState.isEmpty).toBe(true);
        expect(Message.empty(messageInput).toFetching().requestState.isFetching).toBe(true);
        expect(Message.empty(messageInput).toRefetching().requestState.isRefetching).toBe(true);
        expect(Message.empty(messageInput).toSuccess().requestState.isSuccess).toBe(true);
        expect(Message.empty(messageInput).toError().requestState.isError).toBe(true);
    });


});

describe('Message Constructors', () => {
    test('Message.empty will create a empty message without a response', () => {
        const message = Message.empty(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.requestState.isEmpty).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.fetching will create a fetching message without a response', () => {
        const message = Message.fetching(messageInput);
        expect(message.response).toBeUndefined();
        expect(message.requestState.isFetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.refetching will create a refetching message with a response', () => {
        const message = Message.refetching('foo', messageInput);
        expect(message.response).toBe('foo');
        expect(message.requestState.isRefetching).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.success will create a success message with a response', () => {
        const message = Message.success('foo', messageInput);
        expect(message.response).toBe('foo');
        expect(message.requestState.isSuccess).toBe(true);
        expect(message.responseKey).toBe('FOO');
    });

    test('Message.error will create a error message with requestError', () => {
        const message = Message.error('foo', messageInput);
        expect(message.requestError).toBe('foo');
        expect(message.requestState.isError).toBe(true);
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

