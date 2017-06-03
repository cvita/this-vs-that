import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import './App.css';

class App extends Component {
  render() {
    return (
      <Container>
        <div className="app">

          <Row>
            <Col md="12" className="text-center">
              <h1 className="page-header">This vs That</h1>
              <h3 className="subheading">Compare models and brands, places, or superheroes</h3>

              <div className="input-group">
                <input id="initialSearchInput" type="text" className="form-control" placeholder="Example: Sony camera" />
                <span className="input-group-addon">
                  <button type="submit" className="searchBtn">
                    <span>Search</span>
                  </button>
                </span>
              </div>

              <Button className="vsBtn allConjunctionBtns">"vs"</Button>
              <Button className="andBtn allConjunctionBtns">"and"</Button>
              <Button className="withBtn allConjunctionBtns">"with"</Button>
            </Col>

          </Row>



          <Row>

            <Col xs="8">
              <ol className="vsSearchResults allSearchResults"></ol>
              <ol className="andSearchResults allSearchResults"></ol>
              <ol className="withSearchResults allSearchResults"></ol>
            </Col>


            <Col xs="4">
              <ol className="searchHistory"></ol>
              <button className="clearSearchHistoryBtn">clear search history</button>
            </Col>

          </Row>


        </div>
      </Container>
    );
  }
}

export default App;
