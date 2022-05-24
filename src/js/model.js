import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config';
// import { getJSON, sendJSON } from './helper';
import { getJSON, sendJSON } from './helper';

export const state = {
  recipe: {},
  search: {
    query: ``,
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookMarked: [],
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
  };
};
export const loadRecipe = async function (id) {
  try {
    const res = await fetch(
      // `https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bcc40`
      `https://forkify-api.herokuapp.com/api/v2/recipes/${id}`
    );
    console.log(id);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    state.recipe = createRecipeObject(data);
    if (state.bookMarked.some(bookmark => bookmark.id === id)) {
      // console.log(bookmark.id);
      state.recipe.bookMarked = true;
    } else {
      state.recipe.bookMarked = false;
      console.log('no bookmark');
    }
    console.log(state.recipe);
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        sourceUrl: rec.source_url,
        image: rec.image_url,
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
// loadSearchResults('pizza');
///////////////////////////////////
export const getSearchResultPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; //0;
  const end = page * state.search.resultsPerPage; //9;
  return state.search.results.slice(start, end);
};
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    state.recipe.servings = newServings;
    //newQt =  oldQt * newServings / oldServings
  });
};
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookMarked));
};
export const addBookMark = function (recipe) {
  //Add bookmark
  state.bookMarked.push(recipe);
  //Mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookMarked = true;
  persistBookmarks();
};
export const deleteBookmark = function (id) {
  const index = state.bookMarked.fill(el => el.id === id);
  state.bookMarked.splice(index, 1);
  //Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookMarked = false;
  persistBookmarks();
};
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookMarked = JSON.parse(storage);
};
// init();
console.log(state.bookMarked);
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].replaceAll(' ').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format. Please use the correct format'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
      ...(recipe.key && { key: recipe.key }),
    };
    console.log(recipe);
    const data = await sendJSON(`${API_URL}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookMark(state.recipe);
    console.log(data);
  } catch (err) {
    throw err;
  }
};
