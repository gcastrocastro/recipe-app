const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fave-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

getRandomMeal();
fetchFaveMeals();

// async is to allow the fetching of the API/ not really sure...
// the method fetch returns a promise object from an asynchronous operation
// then, the json method parses the promise object into a js object so we can read it.
// the information we need is in the 1st object[0] of the array[meals] we receive
async function getRandomMeal(){
    const resp = await fetch
        ('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0]

    addMeal(randomMeal, true);
}

async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealBySearch(term){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
}

// this addMeal function is in conjunction with the getRandomMeal function above
// it takes in randomMeal and assigns it a false variable if it is random
function addMeal(mealData, random = false) {
    const meal = document.createElement('div');

    meal.classList.add('meal');

    // the $jquery if/or is saying if we have a random-value/false-value then we add the span, if not, an empty string
    meal.innerHTML = (`
            <div class="meal-header">
                ${random ? `<span class="random"> Random Recipe </span>` : ''}
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            </div>
            <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fave-btn">
                    <i class="fa-solid fa-heart"></i>                      
                </button>
            </div>`);

    const btn = meal.querySelector('.meal-body .fave-btn'); 
           
    btn.addEventListener("click", () => {
        if (btn.classList.contains('active')) {
            removeMealfromLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
        } else {
            addMealtoLocalStorage(mealData.idMeal);
            btn.classList.add('active');
        }
        // this is to fetch the updated data every time we click the fave btn
        fetchFaveMeals();
    });

    meal.addEventListener('click', () => {
        updateMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function updateMealInfo(mealData){
    // first we clear the container 
    mealInfoEl.innerHTML = '';

    // Get ingredients and measurements
    const ingredients = [];

    for(let i=1; i<=20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`)
        } else {
            break;
        }
    }

    // update the meal info
    const mealEl = document.createElement('div');

    mealEl.innerHTML = `
            <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <p>${mealData.strInstructions}</p>
            <h3> Ingredients and Measurements: </h3>
            <ul>
                ${ingredients.map(ing => 
                    `<li>${ing}</li>`)
                    .join('')}
            </ul>`

    mealInfoEl.appendChild(mealEl);

    // this shows the popup
    mealPopup.classList.remove('hidden');
}

// Adding/Removing from Local Storage

function addMealtoLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealfromLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    // what is this for?? 
    return mealIds === null ? [] : mealIds;
}

async function fetchFaveMeals(){
    // this is to make the favorite container clear whenever we fetch a new meal
    favoriteContainer.innerHTML='';

    const mealIds = getMealsFromLocalStorage();

    for(let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);

        addMealtoFave(meal);
    }
}

// adding the fave meals to the screen list

function addMealtoFave(mealData) {
    const faveMeal = document.createElement('li');
    // const heart = document.querySelector('.fave-btn');

    // the $jquery if/or is saying if we have a random-value/false-value 
    // then we add the span, if not, an empty string
    faveMeal.innerHTML = (`
    <img src="${mealData.strMealThumb}" 
    alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fa-solid fa-circle-xmark"></i></button>`);

    // NOTE: this constant needs to be placed after the innerHTML bc it's called 
    // AFTER the html has been added.
    const btn = faveMeal.querySelector('.clear');
    
    btn.addEventListener('click', () => {
            // heart.classList.toggle('active');
            removeMealfromLocalStorage(mealData.idMeal);
            fetchFaveMeals();
    });

    faveMeal.addEventListener('click', () => {
        updateMealInfo(mealData);
    });

    favoriteContainer.appendChild(faveMeal);
}

searchBtn.addEventListener('click', async () => {
    // this clears the meal container first after every search
    mealsEl.innerHTML = '';
    const search = searchTerm.value;
    const meals = await getMealBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});


popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
});