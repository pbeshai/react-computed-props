/**
 * Our local d3 build. This is so we can use it as we expect:
 * d3.scaleLinear, d3.line, d3.nest, etc.
 */
import * as array from 'd3-array';
import * as scale from 'd3-scale';
import * as voronoi from 'd3-voronoi';
import * as selection from 'd3-selection';
import * as transition from 'd3-transition';

const d3 = Object.assign({},
  array,
  scale,
  selection,
  transition,
  voronoi,
);

// put d3 in the global window for convenience
window.d3 = d3;

export default d3;
