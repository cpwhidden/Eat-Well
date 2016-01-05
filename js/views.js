var app = app || {};
// Views


// App View
app.AppView = Backbone.View.extend({
	el: '#app',

	initialize : function() {
		_.bindAll(this, 'render');

		this.listenTo(app.config.attributes.currentDate, 'change', this.dateChanged);

		app.ConsumptionHistory.fetch();
		this.dayView = new app.DayView().render();
	},

	dateChanged : function() {
		app.DayFilter.navigate(this.currentDate.getYear() + '/' + this.currentDate.getMonth() + '/' + this.currentDate.getDay(), {trigger: false});
		this.render();
	},

	render : function() {
		this.dayView.render();
	}
});

// FoodItemView
app.FoodItemView = Backbone.View.extend({
	tagName: 'li',

	className: 'consumed-food-list-item',

	template : _.template($('#consumed-food-template').html()),

	initialize : function() {
		_.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	render : function() {
		this.$el.toggleClass('consumed-food');
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

// ResultFoodView
// This view is only used to render the static returns of the Nutritionix API
// The Select2 box manages the 'collection' for these views with its built-in functions
app.ResultFoodView = Backbone.View.extend({
	tagName: 'div',

	template : _.template($('#food-result').html()),

	initialize : function() {
		_.bindAll(this, 'render');
	},

	render : function() {
		this.$el.html(this.template(this.model.attributes));
		this.$el.toggleClass('select2-result');
		return this;
	}
});

// Food Search View
app.FoodSearchView = Backbone.View.extend({
	el: $('#food-search'),
	collection: app.FoodSearchList,

	initialize : function () {
		_.bindAll(this, 'resultSelected');
		$('#food-search').on('select2:select', this.resultSelected);
	},

	resultSelected : function(food) {
		console.log(food.params.data.id);
		console.log(this.collection);
		app.ConsumptionHistory.add(this.collection.where({id: food.params.data.id}));
	}
});

// FoodItemList
app.FoodItemList = Backbone.View.extend({
	el: $('#food-list-div'),
	collection : app.ConsumptionHistory,

	initialize : function() {
		_.bindAll(this, 'render', 'appendItem');
		
		this.collection.bind('change', this.render);
		this.collection.bind('add', this.appendItem);
		// this.collection.bind('remove', this.removeItem);
	},

	render : function() {
		var filtered = this.collection.models.filter(function(item) {
			return datesMatch(app.config.attributes.currentDate, item.attributes.date);
		}, this);
		filtered.forEach(this.appendItem);
	},

	appendItem : function(item) {
		var itemView = new app.FoodItemView({model: item});
		var el = itemView.render().el;
		$('ul', this.el).append(itemView.render().el);
	}
});

// Month View
app.MonthView = Backbone.View.extend({
	el: '#month-view',

	initialize : function() {
		_.bindAll(this, 'render');
	}
});

// Week View
app.WeekView = Backbone.View.extend({
	el: '#week-view',

	initialize : function() {
		_.bindAll(this, 'render');
	}
});

// Day View
app.DayView = Backbone.View.extend({
	el: '#day-view',

	initialize : function() {
		_.bindAll(this, 'render');
		this.$foodList = this.$('#food-list');

		this.listenTo(app.currentDate, 'change', this.goToDate);
		this.foodItemList = new app.FoodItemList();
		this.foodSearchView = new app.FoodSearchView();
		this.render();
	},

	render : function() {
		this.foodItemList.render();
	}
});

datesMatch = function(date1, date2) {
	return date1.getFullYear() == date2.getFullYear() 
		&& date1.getMonth() == date2.getMonth() 
		&& date1.getDate() == date2.getDate();
} 

// Connect app logic to the DOM
$(function() {
	new app.AppView();
});