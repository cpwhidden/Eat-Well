var app = app || {};
// Views


// App View
app.AppView = Backbone.View.extend({
	el: '#app',

	initialize : function() {
		_.bindAll(this, 'render');

		this.listenTo(app.config, 'change:currentDate', this.dateChanged);
		console.log('dateChanged', app.config.get("currentDate"));
		app.ConsumptionHistory.fetch();
		this.dayView = new app.DayView();
		this.weekView = new app.WeekView();
		this.dayView.render();
		this.weekView.render();
	},

	dateChanged : function() {
		console.log('date changed');
		app.DayFilter.navigate(app.config.get("currentDate").getFullYear() + '/' + (app.config.get("currentDate").getMonth() + 1) + '/' + (app.config.get("currentDate").getDay()+1), {trigger: false});
		this.render();
		this.dayView.render();
		this.weekView.render();
	},

	render : function() {
		this.dayView.render();
		this.weekView.render();
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

// FoodItemList - "Collection" view for FoodItemView
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
		$('ul', this.el).html('');
		var filtered = this.collection.models.filter(function(item) {
			return datesMatch(app.config.attributes.currentDate, item.attributes.date);
		}, this);
		filtered.forEach(this.appendItem);
		return this;
	},

	appendItem : function(item) {
		var itemView = new app.FoodItemView({model: item});
		var el = itemView.render().el;
		$('ul', this.el).append(itemView.render().el);
	}
});

// ResultFoodView
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

// Food Search View - "Collection" view for ResultFoodView
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
		this.$weekDayList = $('#week-day-list');
		this.render();
	},

	render : function() {
		// Get dates for all days of currentDate week
		var dates = this.weekDatesForDate(app.config.get("currentDate"));
		console.log('dates', dates);
		// Find aggregrate calorie info for each day
		// Append template html
	},

	weekDatesForDate : function(date) {
		var dates = [];
		var dayOfWeek = date.getDay();
		for (var i = 0; i < 7; i++) {
			var newDate = new Date(date.getTime() + ((i - dayOfWeek) * 86400000));
			dates.push(newDate);
		}
		return dates;
	}

});

// Day View
app.DayView = Backbone.View.extend({
	el: '#day-view',

	initialize : function() {
		console.log('currentDate', app.config.get("currentDate"));
		_.bindAll(this, 'render');
		this.$foodList = this.$('#food-list');
		this.$previousDay = this.$('#previous-day-button');
		this.$today = this.$('#goto-today-button');
		this.$nextDay = this.$('#next-day-button');

		this.$previousDay.on('click', this.gotoPreviousDay);
		this.$today.on('click', this.gotoToday);
		this.$nextDay.on('click', this.nextDay);
		this.foodItemList = new app.FoodItemList();
		this.foodSearchView = new app.FoodSearchView();
		this.render();
	},

	render : function() {
		this.foodItemList.render();
	},

	gotoPreviousDay : function() {
		var newDate = new Date(app.config.get("currentDate").getTime() - 86400000);
		app.config.set({currentDate: newDate});
	},

	gotoToday : function() {
		var newDate = new Date();
		app.config.set({currentDate: newDate});
	},

	nextDay : function() {
		var newDate = new Date(app.config.get("currentDate").getTime() + 86400000);
		app.config.set({currentDate: newDate});
	}
});

datesMatch = function(date1, date2) {
	return date1.getFullYear() == date2.getFullYear() 
		&& date1.getMonth() == date2.getMonth() 
		&& date1.getDate() == date2.getDate();
};

// Connect app logic to the DOM
$(function() {
	console.log('before app view', app.config.get('currentDate'));
	new app.AppView();
});