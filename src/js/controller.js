import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import { getJSON } from './helper';
import { async } from 'regenerator-runtime';
// import searchView from './views/searchView.js';
// import { getJSON } from './helper.js';
// import view from './views/view.js';
// // import ResultsView from './views/resultsView.js';
// import resultsView from './views/resultsView.js';
// // import resultsView from './views/resultsView.js';
// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2
if (module.hot) {
  module.hot.accept();
}
///////////////////////////////////////

const controllRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    //Results view to mark selected result
    resultsView.update(model.getSearchResultPage());
    //Updating bookmark view
    bookmarkView.update(model.state.bookMarked);
    //Loading spinner
    recipeView.renderSpinner();
    //Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;
    //Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    console.log(resultsView);
    //Get search query
    const query = searchView.getQuery();
    if (!query) return;
    //Load search result
    await model.loadSearchResults(query);
    //Render search result

    resultsView.render(model.getSearchResultPage(3));
    //Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  //Render new results
  resultsView.render(model.getSearchResultPage(goToPage));
  //Render pagination buttons
  paginationView.render(model.state.search);
  console.log('pag controller');
};
const controllServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
  //Update the recipe view
};
const controlAddBookmark = function () {
  //Add/remove bookmark
  if (!model.state.recipe.bookMarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //Update recipe view
  recipeView.update(model.state.recipe);
  bookmarkView.render(model.state.bookMarked);
  //Render bookmarks
  bookmarkView.render(model.state.bookMarked);
};
const controlBookmarks = function () {
  bookmarkView.render(model.state.bookMarked);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);
    //Success message
    addRecipeView.renderMessage();
    //Render Bookmark view
    bookmarkView.render(model.state.bookMarked);
    //Change ID in the URL
    window.history.pushState(null, '', `${model.state.recipe.id}`);
    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow(), MODAL_CLOSE_SEC * 1000;
    });
  } catch (err) {
    console.error('##', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controllRecipes);
  recipeView.addHandlerUpdateServings(controllServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  console.log('welcome');
  alert('HACKED!');
};

init();
