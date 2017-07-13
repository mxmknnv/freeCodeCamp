import React from 'react';

class Recipe extends React.Component {
  constructor(props) {
    super(props); 

    this.state = {
        isOpen: false
    }; 

    this.handleOpen = this.handleOpen.bind(this);
  }

  handleOpen() {
    let isOpen = !this.state.isOpen;
    this.setState({ isOpen });
  }

  render() {
    return (
        <div className="recipe">
            <div className="recipe__header">
                <span className="recipe__title" onClick={ this.handleOpen }>{ this.props.name }</span>
                <span className={`recipe__button-edit${this.state.isOpen ? '': ' hide'}`} onClick={() => {this.props.onEdit('edit', this.props.id)}}>Edit</span>
            </div>
            <div className={`recipe__content${this.state.isOpen ? '' : ' hide'}`}>
                <div className="recipe__section">
                    <p className="recipe__section-title">Ingridients:</p>
                    <ul className="recipe__ingridients">
                        {this.props.ingridients.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="recipe__section">
                    <p className="recipe__section-title">Directions:</p>
                    <ol className="recipe__directions">
                        {this.props.directions.map((item, index) => <li key={index}>{item}</li>)}
                    </ol>
                </div>
            </div>
        </div>
    );
  }  
}

export default Recipe;