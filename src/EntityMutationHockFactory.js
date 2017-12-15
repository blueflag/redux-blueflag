//@flow
import RequestStateSelector from './RequestStateSelector';
import {selectEntityByResult} from './EntitySelector';
import DistinctMemo from './utils/DistinctMemo';
import Connect from './utils/Connect';
import {fromJS} from 'immutable';
import React, {type Element} from 'react';
import type {HockOptions} from './definitions';
import type {HockOptionsInput} from './definitions';


/**
 * woot
 * @module Factories
 */


/**
 * EntityMutationHockFactory
 *
 * @param {function} actionCreator
 * @param {HockOptions} hockOptions
 * @returns {MutationHock}
 * @memberof module:Factories
 */
export default function EntityMutationHockFactory(actionCreator: Function, hockOptions?: HockOptionsInput): Function {

    /**
     * Mutation is used to request or change data in response to user interaction.
     * When the `onMutate` functions is called the payload is passed through `payloadCreator` and
     * on to its corresponding promise in the EntityApi.
     * The result of this promise is sent to the entity reducer along with a hash of `payloadCreator` as a `resultKey`.
     * The data is normalized, stored in state and then returned to the component. At each stage of the [entity flow]
     * An appropriate `RequestState` is given to the component. This means the component can be sure that the query is
     * fetching/re-fetching, has thrown an error, or has arrived safely.
     *
     * @example
     *
     * // UserDataHocks.js
     * import {UserMutationHock} from './EntityApi';
     * import DeleteUserQuery from './DeleteUserQuery.graphql';
     *
     * export function DeleteUserMutationHock() {
     *    return UserMutationHock(({id}) => {
     *        return {
     *            query: DeleteUserQuery,
     *            variables: {
     *                id
     *            }
     *        }
     *    });
     * }
     *
     * // User.jsx
     * import React from 'react';
     * import {DeleteUserMutationHock} from './UserDataHocks';
     *
     * function User(props) {
     *     const {id, onMutate} = props;
     *     return <Button onClick={() => onMutate(id)}>Delete User</Button>
     * }
     *
     * const withMutation = DeleteUserMutationHock();
     *
     * export default withMutation(User);
     *
     * @name MutationHock
     * @kind function
     * @param {function} payloadCreator - turns
     * @param {Object} [optionsOverride] - description
     * @returns {function}
     * @memberof module:Hocks
     */
    return function EntityMutationHock(payloadCreator: Function = aa => aa, optionsOverride: HockOptionsInput): Function {

        const options: HockOptions = {
            ...hockOptions,
            onMutateProp: 'onMutate',
            group: null,
            propUpdate: aa => aa,
            propChangeKeys: [],
            ...optionsOverride
        };

        const distinctSuccessMap = new DistinctMemo((value, data) => value.successMap(() => data));

        return function EntityMutationHockApplier(Component: Element<any>): Element<any> {
            const {group} = options;

            const blankConnect = Connect();
            const ComponentWithState = Connect((state: Object, props: Object): Object => {
                const data = selectEntityByResult(state, props.resultKey, options);

                const childProps = options.propUpdate({
                    ...data,
                    requestState: distinctSuccessMap.value(RequestStateSelector(state, props.resultKey, options), data)
                });

                return group
                    ? {[group]: {...props[group], ...childProps}}
                    : childProps;

            }, options)(Component);

            class MutationHock extends React.Component<Object, Object> {
                updateMutation: Function;
                mutation: Function;
                constructor(props: Object) {
                    super(props);
                    this.state = {};
                    this.updateMutation = this.updateMutation.bind(this);
                    this.updateMutation(props);
                }

                componentWillReceiveProps(nextProps: Object) {
                    this.updateMutation(nextProps);
                }

                updateMutation(props: Object) {
                    this.mutation = (data: Object) => {
                        const payload = payloadCreator(data);
                        const resultKey = options.resultKey || fromJS({hash: payload}).hashCode() + options.requestActionName;
                        this.setState({resultKey});
                        props.dispatch(actionCreator(payload, {...options, resultKey}));
                    };
                }

                render(): Element<any> {
                    const childProps = {
                        resultKey: this.state.resultKey,
                        [String(options.onMutateProp)]: this.mutation
                    };
                    const props = group
                        ? {[group]: childProps}
                        : childProps
                    ;

                    return <ComponentWithState {...this.props} {...props} />;
                }
            }

            MutationHock.displayName = `MutationHock(${options.resultKey || ''})`;

            return blankConnect(MutationHock);
        };

    };
}

