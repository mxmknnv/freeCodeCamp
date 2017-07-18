import React from 'react';
import ReactDOM from 'react-dom';
import marked from 'marked';

import 'normalize.css';
import './app.scss';

const initialValue = 'Heading\n=======\n\nSub-heading\n-----------\n \n### Another deeper heading\n \nParagraphs are separated\nby a blank line.\n\nLeave 2 spaces at the end of a line to do a  \nline break\n\nText attributes *italic*, **bold**, \n`monospace`, ~~strikethrough~~ .\n\nShopping list:\n\n  * apples\n  * oranges\n  * pears\n\nNumbered list:\n\n  1. apples\n  2. oranges\n  3. pears' ;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      input: this.props.initialValue,
      output: marked(this.props.initialValue, {sanitize: true})
    };

    this.references = {};
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput(event) {
    let value = event.target.value;
    let markdown = marked(value, {sanitize: true});

    this.setState({input: value, output: markdown});
  }

  createMarkup() {
    return {__html: this.state.output};
  }

  render() {
    return (
      <div className="wrapper">
        <div className="header">
          <p className="header__title">Markdown Previewer</p>
        </div>
        <div className="content">
          <div className="section">
            <p className="section__title">Markdown</p>
            <textarea className="section__input section__pannel" value={this.state.input} onChange={this.handleInput} ref={(element) => {this.references.input = element;}}></textarea>
          </div>
          <div className="section">
            <p className="section__title">Result</p>
            <div className="section__output section__pannel" dangerouslySetInnerHTML={this.createMarkup()} ref={(element) => {this.references.output = element;}}></div>
          </div>
        </div>  
      </div>
    );
  }
}

ReactDOM.render(<App initialValue={initialValue}/>, document.getElementById('root'));