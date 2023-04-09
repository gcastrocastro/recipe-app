const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fave-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");

getRandomMeal();
fetchFaveMeals();

async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
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

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
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
        fetchFaveMeals();
    });

    meal.addEventListener('click', () => {
        updateMealInfo(mealData);
    });
    mealsEl.appendChild(meal);
}

function updateMealInfo(mealData){
    mealInfoEl.innerHTML = '';
    const ingredients = [];

    for(let i=1; i<=20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`)
        } else {
            break;
        }
    }

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
    mealPopup.classList.remove('hidden');
}

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
    return mealIds === null ? [] : mealIds;
}

async function fetchFaveMeals(){
    favoriteContainer.innerHTML='';
    const mealIds = getMealsFromLocalStorage();
    for(let i=0; i<mealIds.length; i++){
        const mealId = mealIds[i];
        const meal = await getMealById(mealId);
        addMealtoFave(meal);
    }
}

function addMealtoFave(mealData) {
    const faveMeal = document.createElement('li');
    faveMeal.innerHTML = (`
    <img src="${mealData.strMealThumb}" 
    alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fa-solid fa-circle-xmark"></i></button>`);

    const btn = faveMeal.querySelector('.clear');
    btn.addEventListener('click', () => {
        removeMealfromLocalStorage(mealData.idMeal);
        fetchFaveMeals();
    });
    faveMeal.addEventListener('click', () => {
        updateMealInfo(mealData);
    });
    favoriteContainer.appendChild(faveMeal);
}

searchBtn.addEventListener('click', async () => {
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