// models
var app = app || {};

// FoodItem
app.FoodItem = Backbone.Model.extend({
	defaults : {
		date : new Date(),
		name : 'Food',
		calories : 0,
		totalFat : 0,
		saturatedFat : 0,
		monounsaturatedFat : 0,
		polyunsaturatedFat : 0,
		carbohydrates : 0,
		dietaryFiber : 0,
		sugar : 0,
		protein : 0,
		sodium : 0,
		cholesterol : 0,
		quantity : 0,
		unit : ''
	}
})

// Recipe
app.Recipe = Backbone.Model.extend({
	defaults : {
		name : 'Recipe',
		url : 'food2fork.com'
	}
})

// Article
app.Article = Backbone.Model.extend({
	defaults : {
		name : 'Article',
		url : 'nytimes.com'
	}
})

// API
app.API = Backbone.Model.extend({

})

// app
app.Config = Backbone.Model.extend({
	defaults : {
		currentDate : new Date()
	}
})

app.config = new app.Config();