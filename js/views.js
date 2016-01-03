var app = app || {};
// Views


// App View
app.AppView = Backbone.View.extend({
	el: '#app',
	events : {
		'click #addItem' : 'addItem'
	},

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
	},

	addItem : function() {
		app.ConsumptionHistory.add(new app.FoodItem({name: "Hello World"}));
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
		
		this.collection.bind('change add', this.render);
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
		_.bindAll(this, 'render');
		this.$foodList = this.$('#food-list');

		this.listenTo(app.currentDate, 'change', this.goToDate);
		this.foodItemList = new app.FoodItemList();
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