import React, { Component } from 'react';
import shallowEquals, { shallowEqualsDebug } from './shallowEquals';

// flag of whether to globally set all components using addComputedProps to debug
let debugAll = false;

// Can set the global debug flag by setting the global __DEBUG_COMPUTED_PROPS__ to true
if (typeof __DEBUG_COMPUTED_PROPS__ !== 'undefined') {
  debugAll = __DEBUG_COMPUTED_PROPS__; // eslint-disable-line no-undef
}

/**
 * Higher order component (HOC) that injects computed props from the
 * computedPropsFunc to the wrapped component. Re-runs computedPropsFunc when props
 * change (except when options say otherwise)
 *
 * Options include:
 *
 * - alwaysRecompute {Boolean} if true, always re-runs computedPropsFunc even if
 *     the props didn't change.
 * - changeExclude {String[]} if provided, changes to these props do NOT trigger
 *     re-running computedPropsFunc. Can't be used with `changeInclude`.
 * - changeInclude {String[]} if provided, ONLY changes to these props triggers
 *     re-running computedPropsFunc. Can't be used with `changeExclude`.
 * - flagRecomputed {Boolean} if true, includes a prop that `recomputedProps`
 *     is true if props were recomputed, false otherwise.
 * - recomputedFlagName {String} the name of the flag added to props indicating
 *     whether the props were recomputed or not
 * - debug {Boolean} if true, prints to the console what props caused it to re-run
 *     computedPropsFunc.
 *
 * @param {Function} computedPropsFunc `function(props) -> {Object}` returns props to inject
 * @param {Object} [options] see above
 * @return {React.Component}
 */
export default function addComputedProps(computedPropsFunc, options = {}) {
  return function addPropsWrapper(WrappedComponent) {
    const {
      alwaysRecompute,
      debug,
      changeExclude,
      changeInclude,
      flagRecomputed = false,
      recomputedFlagName = 'recomputedProps',
    } = options;

    // helper to compute props and optionally include the recomputedProps flag
    function computeProps(props) {
      let computedProps = computedPropsFunc(props);
      if (flagRecomputed) {
        computedProps = Object.assign(
          { [recomputedFlagName]: true },
          computedProps
        );
      }

      return computedProps;
    }

    const displayName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';

    class AddComputedProps extends Component {
      static displayName = `AddComputedProps(${displayName})`;
      static WrappedComponent = WrappedComponent;
      static defaultProps = WrappedComponent.defaultProps;

      // eslint-disable-next-line camelcase
      UNSAFE_componentWillMount() {
        this.propsToAdd = computeProps(this.props);
      }

      // eslint-disable-next-line camelcase
      UNSAFE_componentWillUpdate(nextProps) {
        // recompute props to add only when the props change
        if (
          alwaysRecompute ||
          !shallowEquals(this.props, nextProps, changeExclude, changeInclude)
        ) {
          // output debug messages showing where props changed
          if (debug === true || debugAll) {
            shallowEqualsDebug(
              this.props,
              nextProps,
              changeExclude,
              changeInclude,
              `Computing props in ${displayName} due to prop changes`
            );
          }

          this.propsToAdd = computeProps(nextProps);

          // otherwise we are reusing, so reset the recomputed flag name if it is set
        } else if (this.propsToAdd[recomputedFlagName]) {
          this.propsToAdd = { ...this.propsToAdd, [recomputedFlagName]: false };
        }
      }

      render() {
        return (
          <WrappedComponent {...this.props} {...(this.propsToAdd || {})} />
        );
      }
    }

    return AddComputedProps;
  };
}
