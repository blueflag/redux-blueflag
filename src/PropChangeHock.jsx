import React, {Component} from 'react';
import Immutable, {fromJS} from 'immutable';

/**
 * ```js
 * PropChangeHock(propKeys: [String], sideEffect: function) => (component: Component) => Component
 * ```
 * The prop change hock takes a side effect and an array of prop keys paths.
 * The component then listens for component mount and receive props.
 * If any of the provided props change the side effect is triggered.
 * @param  {Array}      propKeys            list of strings of prop keys
 * @param  {function}   outputFunction
 * @return {function}   componentCreator    function to pass react component
 * @function
 * @memberof module:Misc
 */
export default function PropChangeHock(propKeys = [], outputFunction) {
    return (ComposedComponent) => {
        return class AutoRequest extends Component {
            constructor(props, context) {
                super(props, context);
                this.state = {
                    outputFunction: outputFunction.bind(null, props)
                };
            }
            componentWillMount() {
                outputFunction(this.props);
            }
            componentWillReceiveProps(nextProps) {
                // make props immutable Maps
                const thisPropsImmutable = fromJS(this.props);
                const nextPropsImmutable = fromJS(nextProps);

                const propsHaveChanged = fromJS(propKeys)
                    .some(ii => {
                        const keyPath = ii.split('.');
                        return !Immutable.is(
                            thisPropsImmutable.getIn(keyPath),
                            nextPropsImmutable.getIn(keyPath)
                        );
                    });

                if(propsHaveChanged) {
                    this.setState({outputFunction: outputFunction.bind(null, nextProps)}, () => {
                        outputFunction(nextProps);
                    });
                }
            }
            render() {
                return <ComposedComponent
                    {...this.props}
                    outputFunction={this.state.outputFunction}
                />;
            }
        };
    };
}
