import React, { PureComponent, PropTypes } from 'react';
import { addComputedProps } from 'react-computed-props';
import d3 from './d3';

/**
 * Figure out what is needed to render the chart based on the props of the component
 */
function visProps(props) {
  const {
    data,
    height,
    width,
  } = props;

  const padding = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 50,
  };

  const plotAreaWidth = width - padding.left - padding.right;
  const plotAreaHeight = height - padding.top - padding.bottom;

  const xDomain = d3.extent(data, d => d.x);
  const yDomain = d3.extent(data, d => d.y);
  const xDomainPadding = 0.05 * xDomain[1];
  const yDomainPadding = 0.02 * yDomain[1];

  const xScale = d3.scaleLinear()
    .domain([xDomain[0] - xDomainPadding, xDomain[1] + xDomainPadding])
    .range([0, plotAreaWidth]);

  const yScale = d3.scaleLinear()
    .domain([yDomain[0] - yDomainPadding, yDomain[1] + yDomainPadding])
    .range([plotAreaHeight, 0]);

  const color = ({ y }) => `rgb(150, 200, ${Math.floor(255 * (yScale(y) / plotAreaHeight))})`;


  const voronoiDiagram = d3.voronoi()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .size([plotAreaWidth, plotAreaHeight])(data);

  return {
    color,
    padding,
    plotAreaWidth,
    plotAreaHeight,
    xScale,
    yScale,
    voronoiDiagram,
  };
}

/**
 * Show a bunch of circles
 */
class Circles extends PureComponent {
  static propTypes = {
    color: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number,
    })),
    height: PropTypes.number,
    highlightPointId: PropTypes.number,
    onHighlightPoint: PropTypes.func,
    padding: PropTypes.shape({
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number,
      left: PropTypes.number,
    }),
    plotAreaHeight: PropTypes.number,
    plotAreaWidth: PropTypes.number,
    pointRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
    recomputedProps: PropTypes.bool,
    width: PropTypes.number,
    voronoiDiagram: PropTypes.object,
    xScale: PropTypes.func,
    yScale: PropTypes.func,
  }

  static defaultProps = {
    data: [],
    width: 200,
    height: 200,
    pointRadius: 5,
  }

  /**
   * When the react component mounts, setup the d3 vis
   */
  componentDidMount() {
    this.setup();
  }

  /**
   * When the react component updates, update the d3 vis
   */
  componentDidUpdate() {
    this.update();
  }

  onHoverPoint(d) {
    const { onHighlightPoint } = this.props;

    if (onHighlightPoint) {
      onHighlightPoint(d);
    }
  }

  /**
   * Helper to find the highlight point based off the ID
   */
  getHighlightPoint() {
    const { data, highlightPointId } = this.props;
    if (!data || !data.length || highlightPointId == null) {
      return null;
    }

    const highlightPoint = data.find(d => d.id === highlightPointId);
    return highlightPoint;
  }

  /**
   * Initialize the d3 chart - this is run once on mount
   */
  setup() {
    // transformed to have margin in update() in case we update width/height props
    this.g = d3.select(this.root)
      .append('g');

    this.g.append('rect')
      .style('fill', 'none')
      .style('stroke', '#ccc')
      .style('stroke-dasharray', '4 4');

    this.circles = this.g.append('g').attr('class', 'circles');

    this.voronoi = this.g.append('g')
      .attr('class', 'voronoi')
      .on('mouseleave', () => this.onHoverPoint(null));

    this.highlight = this.g.append('g')
      .attr('class', 'highlight')
      .style('pointer-events', 'none')
      .style('display', 'none');
    this.highlight.append('circle');


    this.update();
  }

  /**
   * Update the d3 chart - this is the main drawing function
   */
  update() {
    const { recomputedProps, padding, plotAreaWidth, plotAreaHeight } = this.props;

    // only update if we recomputed props that these rely on
    if (recomputedProps) {
      this.g.attr('transform', `translate(${padding.left} ${padding.top})`);
      this.g.select('rect')
        .attr('width', plotAreaWidth)
        .attr('height', plotAreaHeight);


      this.updateCircles();
      this.updateVoronoi();
    }

    this.updateHighlight();
  }

  updateVoronoi() {
    const { voronoiDiagram } = this.props;

    const binding = this.voronoi.selectAll('path')
      .data(voronoiDiagram.polygons());

    binding.exit().remove();

    const entering = binding.enter().append('path')
      .style('fill', '#fff')
      .style('opacity', 0);


    binding.merge(entering)
      .attr('d', d => (d ? `M${d.join('L')}Z` : null))
      .on('mouseenter', d => this.onHoverPoint(d.data));
  }

  /**
   * Iterates through data, using line generators to update charts.
   */
  updateCircles() {
    const {
      data,
      color,
      pointRadius,
      xScale,
      yScale,
    } = this.props;

    const binding = this.circles.selectAll('.data-point').data(data, d => d.id);
    binding.exit().remove();
    const entering = binding.enter().append('circle')
      .classed('data-point', true)
      .style('fill', 'red');

    binding.merge(entering)
      .transition()
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', pointRadius)
      .style('fill', d => color(d));
  }

  /**
   * Emphasize the highlighted circle
   */
  updateHighlight() {
    const { pointRadius, xScale, yScale } = this.props;
    const highlightPoint = this.getHighlightPoint();

    // hide if no highlight point
    if (!highlightPoint) {
      this.highlight.style('display', 'none');
      return;
    }

    // show the highlight point as a red circle
    this.highlight.style('display', '');
    this.highlight.select('circle')
      .datum(highlightPoint)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => (typeof pointRadius === 'function' ? pointRadius(d) : pointRadius) * 1.5)
      .style('fill', 'tomato');
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg
        ref={(node) => { this.root = node; }}
        className="Circles"
        height={height}
        width={width}
      />
    );
  }
}

export default addComputedProps(visProps, {
  debug: true,
  flagRecomputed: true,
  changeExclude: ['highlightPointId'],
})(Circles);
