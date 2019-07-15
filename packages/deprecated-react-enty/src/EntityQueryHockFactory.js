//@flow
import type {ComponentType} from 'react';
import type {HockApplier} from './util/definitions';
import type {HockOptionsInput} from './util/definitions';
import type {HockOptions} from './util/definitions';
import type {Hock} from './util/definitions';

import PropChangeHoc from './util/PropChangeHoc';
import RequestStateSelector from 'enty-state/lib/RequestStateSelector';
import {selectEntityByResult} from 'enty-state/lib/EntitySelector';
import DistinctMemo from 'enty-state/lib/util/DistinctMemo';
import Connect from './util/Connect';
import Deprecated from './util/Deprecated';
import Hash from 'enty-state/lib/util/Hash';


/**
 * EntityQueryHockFactory
 */
function EntityQueryHockFactory(actionCreator: Function, hockOptions?: HockOptionsInput): Hock {

    /**
     * EntityQueryHock
     *
     * QueryHock is used to request data before a component renders.
     * When one of the `updateKeys` on props changes the hock will pass the current props through
     * `queryCreator` and on to its corresponding promise in EntityApi.
     * The result of this promise is sent to the entity reducer along with a hash of `queryCreator` as a `resultKey`.
     *
     * The data is normalized, stored in state and then returned to the component. At each stage of the [entity flow]
     * An appropriate `RequestState` is given to the component. This means the component can be sure that the query is
     * fetching/re-fetching, has thrown an error, or has arrived safely.
     *
     * @kind function
     */
    function EntityQueryHock(queryCreator: Function = () => null, optionsOverride: HockOptionsInput|Array<string>): HockApplier {
        Deprecated('EntityQueryHock has been deprecated in favor of much improved RequestHock. Check the docs for usage instructions.');
        function parseOptions(options: HockOptionsInput|Array<string>): Object {
            if(Array.isArray(options)) {
                return {propChangeKeys: optionsOverride};
            }
            return options;
        }


        // distinct memo must be unique to each useage of EntityQuery
        const distinctSuccessMap = new DistinctMemo((value, data) => value.successMap(() => data));


        /**
         * EntityQueryHockApplier
         */
        function EntityQueryHockApplier(Component: ComponentType<any>): ComponentType<any> {

            const originalOptions: HockOptions = {
                ...hockOptions,
                group: null,
                propUpdate: aa => aa,
                updateResultKey: (aa) => aa,
                propChangeKeys: [],
                ...parseOptions(optionsOverride)
            };

            let options = {
                ...originalOptions
            };


            function getHash(props: Object, options: HockOptions): string {
                return options.resultKey || Hash({hash: queryCreator(props), requestActionName: options.requestActionName});
            }

            const withState = Connect((state: Object, props: Object): Object => {
                const resultKey = options.updateResultKey(getHash(props, options), props);

                const data = selectEntityByResult(state, resultKey, options);
                const childProps = options.propUpdate({
                    ...data,
                    requestState: distinctSuccessMap.value(RequestStateSelector(state, resultKey, options), data)
                });

                return options.group
                    ? {[options.group]: childProps}
                    : childProps;

            }, options);

            const withPropChange = PropChangeHoc({
                auto: options.propChangeKeys,
                onPropChange: (props: Object): any => {
                    options.resultKey = getHash(props, options);
                    return props.dispatch(actionCreator(queryCreator(props), {...options, resultKey: options.resultKey && options.updateResultKey(options.resultKey, props)}));
                }
            });

            return withState(withPropChange(Component));
        }

        return EntityQueryHockApplier;

    }

    return EntityQueryHock;
}

export default EntityQueryHockFactory;