var app = app || {};

// Views


// App View
app.AppView = Backbone.View.extend({
	el: '#app',
	currentDate : new Date(),
	events : {
		'click #addItem' : 'addItem'
	},

	initialize : function() {
		console.log('initializing app view');
		_.bindAll(this, 'render');

		this.listenTo(this.currentDate, 'change', this.navigate);

		app.ConsumptionHistory.fetch();
		new app.FoodItemList();
	},

	navigate : function() {
		console.log('navigating');
		app.DayFilter.navigate(this.currentDate.getYear() + '/' + this.currentDate.getMonth() + '/' + this.currentDate.getDay(), {trigger: false});
	},

	addItem : function() {
		app.ConsumptionHistory.add(new app.FoodItem({name: "Hello World"}));
		console.log(app.ConsumptionHistory.length);
	}

});

// FoodItemView
app.FoodItemView = Backbone.View.extend({
	tagName: 'li',

	template : _.template($('#food-item').html()),

	initialize : function() {
		_.bindAll(this, 'render');
		this.listenTo(this.model, 'change', this.render);
	},

	render : function() {
		console.log('rendering item view');
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

// FoodItemList
app.FoodItemList = Backbone.View.extend({
	el: $('#food-list'),
	collection : app.ConsumptionHistory,

	initialize : function() {
		_.bindAll(this, 'render', 'appendItem');
		
		this.collection.bind('add', this.appendItem);
	},

	appendItem : function(item) {
		console.log(this.collection);
		console.log(item.attributes);
		console.log('appending to food item list');
		var itemView = new app.FoodItemView({model: item});
		var el = itemView.render().el;
		console.log(itemView);
		console.log($('ul', this.el));
		$('ul', this.el).append(itemView.render().el);
	}
})

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
		console.log('initializing day view');
		_.bindAll(this, 'render', 'goToDate');
		this.$foodList = this.$('#food-list');

		this.listenTo(app.currentDate, 'change', this.goToDate);
	},

	goToDate : function() {
		this.$foodList.html('');
		var currentDate = app.AppView.currentDate;
		var foodItemsForCurrentDay = _.filter(app.ConsumptionHistory, function() {
			var dateMatches = this.date.getYear() == currentDate.getYear() && this.date.getMonth() == currentDate.getMonth() && this.date.getDate() == currentDate.getDate();
			return dateMatches;
		})
		foodItemsForCurrentDay.each(this.addFoodItemView, this);
	},

	addFoodItemView : function(foodItem) {
		var view = new FoodItemView({model: foodItem});
		this.$foodList.append(view);
	}
});

// Connect app logic to the DOM
$(function() {
	console.log('initializing app');
	new app.AppView();
});