// collections

var app = app || {};

// ConsumptionHistory
app.ConsumptionHistoryCollection = Backbone.Collection.extend({
	model : app.FoodItem,
	localStorage: new Backbone.LocalStorage("ConsumptionHistory")
})

app.ConsumptionHistory = new app.ConsumptionHistoryCollection();

// Food search list (from Nutritionix API)
app.FoodSearchList = Backbone.Collection.extend({
	model : app.FoodItem,
})

// Trending recipes (food2fork.com)
app.Recipes = Backbone.Collection.extend({
	model : app.Recipe
})

// NYTimes articles
app.Articles = Backbone.Collection.extend({
	model : app.Article
})

// API List
app.APIList = Backbone.Collection.extend({
	model : app.API
})