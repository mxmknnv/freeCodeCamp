import React from 'react';
import SETTINGS from '../settings_format.js';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.settings;

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnBlur(event) {
    let type = event.target.getAttribute('data-type');
    let value = parseInt(event.target.value, 10);
    
    if(isNaN(value)) {
      value = SETTINGS[type].default; 
    }

    if(value < SETTINGS[type].min) {
      value = SETTINGS[type].min;
    }

    if(value > SETTINGS[type].max) {
      value = SETTINGS[type].max;
    }

    this.setState({ [type]: value });
  }

  handleOnChange(event) {
    let type = event.target.getAttribute('data-type');
    this.setState({ [type]: event.target.value });  
  }

  handleOnClick(event) {
    let type = event.target.getAttribute('data-type');

    switch(type) {
      case 'apply': {
        this.props.onSettingsChange(this.state);
        this.props.onSettingsClick();
      } break;
      case 'cancel': {
        this.props.onSettingsClick();
      } break;
      default: {
        console.error(`Unknown type: ${type}`);
      };
    }
  }
    
  render() {
    return (
      <div className={`settings header__settings${this.props.state ? '': ' hide'}`}>
        <div className="settings__section">
          <span className="settings__key">Update timer</span>
          <input value={this.state.updateTimer} data-type="updateTimer" onChange={this.handleOnChange} onBlur={this.handleOnBlur} type="text" className="settings__value"/>
        </div>
        <div className="settings__section">
          <span className="settings__key">Percent of live cells</span>
          <input value={this.state.percentOfLiveCells} data-type="percentOfLiveCells" onChange={this.handleOnChange} onBlur={this.handleOnBlur} type="text" className="settings__value"/>
        </div>
        <div className="settings__section">
          <span className="settings__key">Cell size (px)</span>
          <input value={this.state.cellSize} data-type="cellSize" onChange={this.handleOnChange} onBlur={this.handleOnBlur} type="text" className="settings__value"/>
        </div>
        <div className="settings__section">
          <span className="settings__key">Number of rows</span>
          <input value={this.state.numberOfRows} data-type="numberOfRows" onChange={this.handleOnChange} onBlur={this.handleOnBlur} type="text" className="settings__value"/>
        </div>
        <div className="settings__section">
          <span className="settings__key">Number of columns</span>
          <input value={this.state.numberOfColumns} data-type="numberOfColumns" onChange={this.handleOnChange} onBlur={this.handleOnBlur} type="text" className="settings__value"/>
        </div>
        <div className="setting__controls">
          <span data-type="apply" onClick={this.handleOnClick} className="settings__button settings__button_blue">Apply</span>
          <span data-type="cancel" onClick={this.handleOnClick} className="settings__button settings__button_orange">Cancel</span>
        </div>
      </div>
    );
  }
}

export default Settings;