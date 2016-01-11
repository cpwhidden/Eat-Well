// collections

var app = app || {};

// ConsumptionHistory
app.ConsumptionHistoryCollection = Backbone.Firebase.Collection.extend({
	model : app.FoodItem,
	url : 'https://blazing-inferno-5166.firebaseio.com/ConsumptionHistory',
	comparator : 'date',
	autoSync: true
})

app.ConsumptionHistory = new app.ConsumptionHistoryCollection();

// Food search list (from Nutritionix API)
app.FoodSearchListCollection = Backbone.Collection.extend({
	model : app.FoodItem,
})
app.FoodSearchList = new app.FoodSearchListCollection();