import React from 'react';
import ReactDOM from 'react-dom';

import RECIPES_DATA from './recipes.js';
import Recipe from './components/Recipe';
import Modal from './components/Modal';

import 'normalize.css';
import './app.scss';
import './components/recipe.scss';
import './components/modal.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    if(!this.setInitialDataFromLocalStorage()) {
      this.recipes = props.initialData.recipes;
      this.lastIndex = props.initialData.lastIndex;
    }

    this.references = {
      searchInput: null
    };

    this.flags = {
      searchIsActive: false
    };
    
    this.state = {  
        displayedRecipes: this.recipes,
        modal: {
          isActive: false,
          mode: 'add',
          recipe: null
        }
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.openModal = this.openModal.bind(this);
    
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSaveChanges = this.handleSaveChanges.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleSearch() {
    let searchQuery = this.references.searchInput.value.toLowerCase();
    let displayedRecipes = this.recipes.filter((el) => el.name.toLowerCase().includes(searchQuery));

    this.flags.searchIsActive = searchQuery.length > 0 ? true : false; 
    this.setState({ displayedRecipes });
  }

  openModal(mode, recipeID) {
    switch(mode) {
      case 'add': {
        this.setState({ 
          modal: {
            isActive: true,
            mode: 'add',
            recipe: null
          }
        });
      } break;
      case 'edit': {
        let recipe = this.recipes.filter((el) => el.id == recipeID)[0];

        this.setState({ 
          modal: {
            isActive: true,
            mode: 'edit',
            recipe: recipe
          }
        });
      } break;
      default: {
        console.error(`Unknown mode: ${mode}`);
      }
    }
  }

  closeModal() {
    this.setState({ 
      modal: {
        isActive: false,
        mode: 'add',
        recipe: null
      }
    });
  }

  getContent() {
    let recipes = this.state.displayedRecipes.map((recipe) => 
      <Recipe 
        key={recipe.id}
        id={recipe.id}
        name={recipe.name}
        directions={recipe.directions}
        ingridients={recipe.ingridients}
        onEdit={this.openModal}
      />
    );

    if(recipes.length > 0) {
      return recipes;  
    } else {
      let message = '';

      if(this.flags.searchIsActive) {
        message = `There's no result for "${ this.references.searchInput.value }".`;
      } else {
        message = `There's no recipes...`;
      }

      return (<p className="content__message">{message}</p>);
    }
  }

  handleAdd(recipe) {
    recipe.id = ++this.lastIndex;

    this.recipes.push(recipe);
    this.update();
    this.closeModal();
  }

  update() {
    this.updateDisplayedRecipes();
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem('lastIndex', this.lastIndex);
    localStorage.setItem('recipes', JSON.stringify(this.recipes));
  }

  setInitialDataFromLocalStorage() {
    let lastIndex = localStorage.getItem('lastIndex');
    let recipes = localStorage.getItem('recipes');

    if(lastIndex == null || recipes == null) {
      return false;
    } else {
      this.lastIndex = Number(lastIndex);
      this.recipes = JSON.parse(recipes); 

      return true;
    }
  }

  updateDisplayedRecipes() {
    if(this.flags.searchIsActive) {
      this.handleSearch();
    } else {
      this.setState({
        displayedRecipes: this.recipes 
      });
    }
  }

  handleDelete(recipeID) {
    this.recipes = this.recipes.filter((el) => el.id !== recipeID);
    this.update();
    this.closeModal();
  }

  handleSaveChanges(recipeID, data) {
    this.recipes = this.recipes.map((el) => el.id == recipeID ? data : el);
    this.update();
    this.closeModal();
  }

  handleCancel() {
    this.closeModal();
  }

  render() {
    return (
      <div>
        <div className="wrapper">
          <div className="header">
            <span className="header__logo">recipe box</span>
            <input className="header__input-search" type="text" placeholder="Search for recipes" ref={(el) => {this.references.searchInput = el;}} onChange={this.handleSearch}/> 
            <span className="header__button-add" onClick={() => {this.openModal('add')}}>add recipe</span>
          </div>
          <div className="content">
            {this.getContent()}  
          </div>  
        </div>
        <Modal data={this.state.modal} onAdd={this.handleAdd} onDelete={this.handleDelete} onSaveChanges={this.handleSaveChanges} onCancel={this.handleCancel}/>
      </div>
    );
  }
}

ReactDOM.render(<App initialData={RECIPES_DATA} />, document.getElementById('root'));