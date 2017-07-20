import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import 'normalize.css';
import './app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sort: 'recent',
      data: []
    };

    this.switchSortOrder = this.switchSortOrder.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    fetch(`https://fcctop100.herokuapp.com/api/fccusers/top/${this.state.sort}`)
      .then(response => response.json())
      .then(data => this.setState({ data }))
      .catch(error => console.error(error));
  }

  switchSortOrder(event) {
    let sort = event.target.getAttribute('data-sort');

    if(sort !== this.state.sort) {
      this.setState({ sort }, this.getData);
    }
  }

  getTableContent() {
    return this.state.data.map((item, i) => 
        <TableRow 
          key={item.username}
          index={i+1}
          username={item.username} 
          img={item.img}   
          recent={item.recent}
          alltime={item.alltime}
        />);
  }

  render() {
    return (
      <div className="wrapper">
        <div className="header">
          <p className="header__title">FreeCodeCamp Leaderboard</p>
        </div>
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th className={`points${this.state.sort == 'recent' ? ' active' : ''}`} data-sort="recent" onClick={this.switchSortOrder}>Points (last 30 days)</th>
                <th className={`points${this.state.sort == 'alltime' ? ' active' : ''}`} data-sort="alltime" onClick={this.switchSortOrder}>Points (all time)</th>
              </tr>
            </thead>
            <tbody>
              {this.getTableContent()}
            </tbody>
          </table>
        </div>  
      </div>
    );
  }
}

function TableRow(props) {
    return (
        <tr>
            <td>{props.index}</td>
            <td>
                <img src={props.img} alt="Camper Photo"/>
                <a href={`https://www.freecodecamp.com/${props.username}`} target="_blank">{props.username}</a>
            </td>
            <td>{props.recent}</td>
            <td>{props.alltime}</td>
        </tr>
    );
}

TableRow.propTypes = {
  index: PropTypes.number.isRequired,
  username: PropTypes.string.isRequired,
  img: PropTypes.string.isRequired,
  recent: PropTypes.number.isRequired,
  alltime: PropTypes.number.isRequired
};

ReactDOM.render(<App />, document.getElementById('root'));