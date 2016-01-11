// models
var app = app || {};

// FoodItem
app.FoodItem = Backbone.Model.extend({
	defaults : {
		id : "",
		dateTime : new Date().getTime(),
		name : 'Food',
		calories : 0,
		fat : 0,
		saturatedFat : 0,
		monounsaturatedFat : 0,
		polyunsaturatedFat : 0,
		transFat : 0,
		carbohydrates : 0,
		dietaryFiber : 0,
		sugar : 0,
		protein : 0,
		quantity : 0,
		unit : ''
	}
})

// Recipe
app.Recipe = Backbone.Model.extend({
	defaults : {
		name : 'Recipe',
		url : 'food2fork.com',
		rating : '0'
	}
})

// Article
app.Article = Backbone.Model.extend({
	defaults : {
		headline : 'Headline',
		snippet : 'Snippet',
		url : 'nytimes.com'
	}
})

// app
app.Config = Backbone.Model.extend({
	defaults : {
		currentDate : new Date()
	}
})
app.config = new app.Config();
