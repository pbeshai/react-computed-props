# react-computed-props

[![npm version](https://badge.fury.io/js/react-computed-props.svg)](https://badge.fury.io/js/react-computed-props)
[![Build Status](https://travis-ci.org/pbeshai/react-computed-props.svg?branch=master)](https://travis-ci.org/pbeshai/react-computed-props)

A higher-order component for React to add computed or derived props to the wrapped component for better performance.

### Installation

```
npm install --save react-computed-props
```

### How do I use it?

To make use of React Computed Props, you just need two things:

- a function that compute properties (e.g., `computeProps(props)`)
- a component that will receive the computed properties (e.g., `MyComponent`)

When you've got those, you just wrap your component with the `addComputedProps` higher-order component like so:

```js
addComputedProps(computeProps)(MyComponent);
```

Here's a simple example demonstrating using computed props to find the minimum value in the `data` prop. By using `addComputedProps`, we can save ourselves from having to cycle through the whole dataset each time render is called, which can make a difference if you the dataset is large and render is called quite frequently (e.g., when handling mouse interaction events). The more expensive the computed props are, the more performance benefits you'll get from using `addComputedProps`.

```js
import React, { Component, PropTypes } from 'react';
import addComputedProps from 'react-computed-props';

function computeProps(props) {
  const { data } = props;

  let minimum;
  if (data && data.length) {
    data.forEach((d) => {
      if (minimum == null || d < minimum) {
        minimum = d;
      }
    });
  }

  return {
    minimum,
  };
}

class DataSummary extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    minimum: PropTypes.number,
  }

  render() {
    const { data, minimum } = this.props;

    return (
      <div className="DataSummary">
        <ul>
          <li>Data length: {data ? data.length : '--'}</li>
          <li>Minimum value: {minimum}</li>
        </ul>
      </div>
    );
  }
}

export default addComputedProps(computeProps)(DataSummary);
```

### Examples

- [many-circles](https://github.com/pbeshai/react-computed-props/tree/master/examples/many-circles) - An example of creating a visualization of 2000 circles with d3.


### API Reference

#### `addComputedProps(computePropsFunc, [options])(WrappedComponent)`

Higher-order component that provides props computed in the `computePropsFunc` to the `WrappedComponent`. Unless `alwaysRecompute` is set, the computed properties will only be updated when the props it receives change. It takes the following options:


- `alwaysRecompute` (*Boolean*): If true, always re-runs `computedPropsFunc` even if the props didn't change. Defaults to false.

- `changeExclude` (*String[]*): If provided, changes to these props do NOT trigger re-running `computedPropsFunc`. Can't be used with `changeInclude`.

- `changeInclude` (*String[]*): If provided, ONLY changes to these props triggers re-running `computedPropsFunc`. Can't be used with `changeExclude`.

- `flagRecomputed` (*Boolean*): If true, includes a prop `recomputedProps` that is true if props were recomputed and false otherwise.

- `recomputedFlagName` (*String*): The name of the flag added to props indicating whether the props were recomputed or not, used when `flagRecomputed` is true. Defaults to `'recomputedProps'`.

- `debug` (*Boolean*): If true, prints to the console which props caused it to re-run `computedPropsFunc`. This is useful for ensuring only props you expect to be changing are changing.

##### Arguments

1. `computePropsFunc` (*Function*): A function mapping from `props` to an object of computed props. These are used in addition to the regular `props` received when rendering `WrappedComponent`. If `props` contains keys that are also returned from `computePropFunc`, the values returned from `computePropFunc` will overwrite them.
1. [`options`] (*Object*): The options object as described above.
2. `WrappedComponent` (*React Component*): The component to inject the URL query parameters into as props.

##### Returns

A React component class

##### Remarks

* Needs to be called twice `addComputedProps(computePropsFunc, [options])(MyComponent)`.


### Development

During development of examples, it can be helpful to have a watch running automatically rebuilding the package when changes take place. To get this running run:

```
npm run dev
```

#### Building

```
npm run build
```

#### Linting

```
npm run lint
```

To lint examples, run:

```
npm run lint:examples
```

#### Testing

```
npm run test
```

To test examples, run:

```
npm run test:examples
```


### License

MIT
