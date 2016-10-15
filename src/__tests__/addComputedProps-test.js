import React from 'react';
import { shallow } from 'enzyme';
import addComputedProps from '../addComputedProps';

const MyComponent = () => <div />;

describe('addComputedProps', () => {
  it('adds in props', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));

    const Wrapped = addComputedProps(computeProps)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    expect(props.prop1).toBe(9);
    expect(props.prop2).toBe('test');
    expect(props.computed1).toBe(900);
    expect(props.computed2).toEqual([1, 2, 3]);
    expect(computeProps).toHaveBeenCalledTimes(1);
  });

  it('does not recompute props if no change', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));

    const Wrapped = addComputedProps(computeProps)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    const computed2First = props.computed2;
    expect(computeProps).toHaveBeenCalledTimes(1);

    // set to same props -- so should not recompute
    wrapper.setProps({ prop1: 9, prop2: 'test' });
    expect(computeProps).toHaveBeenCalledTimes(1);
    const props2 = wrapper.first().props();
    expect(props2.computed2).toBe(computed2First);
    expect(props).toEqual(props2);
  });

  it('recompute props if they change', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));

    const Wrapped = addComputedProps(computeProps)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    const computed2First = props.computed2;
    expect(computeProps).toHaveBeenCalledTimes(1);

    // set to different props, so should recompute
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    expect(computeProps).toHaveBeenCalledTimes(2);
    const props2 = wrapper.first().props();
    expect(props2.computed2).not.toBe(computed2First);
    expect(props2.computed1).toBe(1900);
  });

  it('recompute props if no change and alwaysRecompute is set', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      alwaysRecompute: true,
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    const computed2First = props.computed2;
    expect(computeProps).toHaveBeenCalledTimes(1);

    // set to same props, recomputes because alwaysRecompute is set
    wrapper.setProps({ prop1: 9, prop2: 'test' });
    expect(computeProps).toHaveBeenCalledTimes(2);
    const props2 = wrapper.first().props();
    expect(props2.computed2).not.toBe(computed2First);
  });

  it('adds recomputedProps flag correctly', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      flagRecomputed: true,
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`
    expect(props.recomputedProps).toBe(true);

    // set to different props, so should recompute
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    const props2 = wrapper.first().props();
    expect(props2.recomputedProps).toBe(true);

    // set to same props so expect to be false
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    const props3 = wrapper.first().props();
    expect(props3.recomputedProps).toBe(false);
  });

  it('configures recomputedProps flag name', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      flagRecomputed: true,
      recomputedFlagName: 'dataChanged',
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`
    expect(props.dataChanged).toBe(true);
    expect(props.recomputedProps).toBeUndefined();

    // set to different props, so should recompute
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    const props2 = wrapper.first().props();
    expect(props2.dataChanged).toBe(true);

    // set to same props so expect to be false
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    const props3 = wrapper.first().props();
    expect(props3.dataChanged).toBe(false);
  });

  it('ignores changes in changeExclude props', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      changeExclude: ['prop1'],
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    const computed2First = props.computed2;
    expect(computeProps).toHaveBeenCalledTimes(1);

    // only prop1 changed but it's excluded from checking, so ignore
    wrapper.setProps({ prop1: 19, prop2: 'test' });
    expect(computeProps).toHaveBeenCalledTimes(1);
    const props2 = wrapper.first().props();
    expect(props2.computed2).toBe(computed2First);
    expect(props2.computed1).toBe(900);
    expect(props2.prop1).toBe(19);
  });

  it('only check changes in changeInclude props', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      changeInclude: ['prop2'],
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    const props = wrapper.first().props(); // this only works when using `shallow` not `mount`

    const computed2First = props.computed2;
    expect(computeProps).toHaveBeenCalledTimes(1);

    // only prop1 changed but it's excluded from checking, so ignore
    wrapper.setProps({ prop1: 19, prop2: 'test', prop3: 99 });
    expect(computeProps).toHaveBeenCalledTimes(1);
    const props2 = wrapper.first().props();
    expect(props2.computed2).toBe(computed2First);
    expect(props2.computed1).toBe(900);
    expect(props2.prop1).toBe(19);
  });

  it('setting debug to true does not cause errors', () => {
    const computeProps = jest.fn().mockImplementation(props => ({
      computed1: props.prop1 * 100,
      computed2: [1, 2, 3],
    }));
    const options = {
      debug: true,
    };

    const Wrapped = addComputedProps(computeProps, options)(MyComponent);
    const wrapper = shallow(<Wrapped prop1={9} prop2={'test'} />);
    // cause an update so the debug line is triggered
    wrapper.setProps({ prop1: 19, prop2: 'test', prop3: 99 });
  });
});


// test changeInclude, changeExclude, debug
