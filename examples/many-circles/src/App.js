import React, { Component } from 'react';
import d3 from './d3';

import Circles from './Circles';
import './App.css';

function generateData() {
  return d3.range(2000).map(id => ({ id, x: Math.random(), y: Math.random() }));
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: generateData(),
    };

    this.handleGenerateData = this.handleGenerateData.bind(this);
    this.handleHighlightPoint = this.handleHighlightPoint.bind(this);
  }

  handleGenerateData() {
    this.setState({
      data: generateData(),
    });
  }

  handleHighlightPoint(d) {
    this.setState({
      highlightPointId: d ? d.id : null,
    });
  }

  render() {
    const { data, highlightPointId } = this.state;

    return (
      <div className="App">
        <div>
          <button onClick={this.handleGenerateData}>Random 2000 Circles</button>
        </div>
        <Circles
          data={data}
          width={900}
          height={900}
          highlightPointId={highlightPointId}
          onHighlightPoint={this.handleHighlightPoint}
        />
      </div>
    );
  }
}

export default App;
