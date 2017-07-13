import React from 'react';

class Modal extends React.Component {
    constructor(props) {
        super(props);

        this.references = {};

        this.state = {
            name: '',
            ingridients: '',
            directions: ''
        };
        
        this.handleModalClick = this.handleModalClick.bind(this);
    }

    handleModalClick(event) {
        if(event.target == this.references.modal) {
            this.props.onCancel();
        }
    }

    componentWillReceiveProps(nextProps) {
        const messages = [
            'Recipe',
            'Enter ingredients. You can use a new line to split ingredients.',
            'Enter directions. You can use a new line to split directions.'
        ];

        this.setState({
            name: nextProps.data.mode == 'add' ? messages[0] : nextProps.data.recipe.name,
            ingridients: nextProps.data.mode == 'add' ? messages[1] : nextProps.data.recipe.ingridients.join('\n'),
            directions: nextProps.data.mode == 'add' ? messages[2] : nextProps.data.recipe.directions.join('\n')
        });    
    }

    getRecipeData() {
        const regexp = /[^\s\\]/;

        function f(item) {
            return regexp.test(item);
        }

        return {
            id: this.props.data.mode == 'add' ? null : this.props.data.recipe.id,
            name: regexp.test(this.state.name) ? this.state.name : 'No name',
            ingridients: regexp.test(this.state.ingridients) ? this.state.ingridients.split('\n').filter(f) : ['No ingridients'],
            directions: regexp.test(this.state.directions) ? this.state.directions.split('\n').filter(f) : ['No directions']
        };
    }

    render() {
        return (
            <div className={`modal${this.props.data.isActive ? '': ' hide'}`} onClick={this.handleModalClick} ref={(el) => {this.references.modal = el;}}>
                <div className="modal__block">
                    <div className="modal__header">
                        <p className="modal__title">{this.props.data.mode == 'add' ? 'Add Recipe' : 'Edit Recipe'}</p>    
                    </div>
                    <div className="modal__content">
                        <div className="modal__section">
                            <p className="modal__section-name">Name</p>
                            <input value={this.state.name} onChange={(event) => {this.setState({name: event.target.value})}} type="text" className="modal__input"/>
                        </div>
                        <div className="modal__section">
                            <p className="modal__section-name">Ingridients</p>
                            <textarea value={this.state.ingridients} onChange={(event) => {this.setState({ingridients: event.target.value})}} className="modal__textarea"></textarea>
                        </div>
                        <div className="modal__section">
                            <p className="modal__section-name">Directions</p>
                            <textarea value={this.state.directions} onChange={(event) => {this.setState({directions: event.target.value})}} className="modal__textarea"></textarea>
                        </div>
                    </div>  
                    <div className="modal__footer">
                        {
                            this.props.data.mode == 'add'
                            ? [
                                <span key="0" className="modal__button modal__button_green" onClick={() => {this.props.onAdd(this.getRecipeData())}}>Add Recipe</span>,
                                <span key="1" className="modal__button modal__button_orange" onClick={this.props.onCancel}>Cancel</span>
                            ]
                            : [
                                <span key="2" className="modal__button modal__button_green" onClick={() => {this.props.onSaveChanges(this.props.data.recipe.id, this.getRecipeData())}}>Save Changes</span>,
                                <span key="3" className="modal__button modal__button_red" onClick={() => {this.props.onDelete(this.props.data.recipe.id)}}>Delete</span>
                            ]
                        } 
                    </div>
                </div>  
            </div>
        );
    }
}

export default Modal;