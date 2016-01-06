var app = app || {};
// Views


// App View
app.AppView = Backbone.View.extend({
	el: '#app',

	initialize : function() {
		_.bindAll(this, 'render');

		this.listenTo(app.config, 'change:currentDate', this.dateChanged);
		app.ConsumptionHistory.fetch();
		this.dayView = new app.DayView();
		this.weekView = new app.WeekView();
		this.articleListView = new app.ArticleListView();
		this.recipeListView = new app.RecipeListView();
		this.render();
	},

	dateChanged : function() {
		app.DayFilter.navigate(app.config.get("currentDate").getFullYear() + '/' + 
							  (app.config.get("currentDate").getMonth() + 1) + '/' + 
							  (app.config.get("currentDate").getDay()+1), {trigger: false});
		this.render();
	},

	render : function() {
		this.dayView.render();
		this.weekView.render();
		this.articleListView.render();
		this.recipeListView.render();
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
		_.bindAll(this, 'render', 'appendItem', 'testToAppend');
		
		this.collection.bind('change', this.render);
		this.collection.bind('add', this.testToAppend);
		// this.collection.bind('remove', this.removeItem);
	},

	render : function() {
		$('ul', this.el).html('');
		var filtered = filteredCollectionForDay(this.collection, app.config.get('currentDate'));
		filtered.forEach(this.appendItem);
		return this;
	},

	appendItem : function(item) {
		var itemView = new app.FoodItemView({model: item});
		var el = itemView.render().el;
		$('ul', this.el).append(itemView.render().el);			
	},

	testToAppend : function(item) {
		console.log('testing to append');
		console.log(app.config.get('currentDate'), item.get('date'));
		if (datesMatch(app.config.get('currentDate'), item.get('date'))) {
			this.appendItem(item);
		}
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
	collection : app.ConsumptionHistory,

	initialize : function() {
		_.bindAll(this, 'render');

		this.collection.bind('change', this.render);
		this.collection.bind('add', this.render);

		this.$weekDayList = $('#week-day-list');
		this.render();
	},

	render : function() {
		console.log('rendering week view');
		// Get dates for all days of currentDate week
		var dates = this.weekDatesForDate(app.config.get("currentDate"));
		console.log('dates', dates);
		// Find aggregrate calorie info for each day
		var weekData = dates.map(function(date){
			return consumptionHistoryForDate(date).reduce(function(previousValue, currentValue) {
				return {date: previousValue.date, calories : (previousValue.calories + currentValue.get("calories"))};
			}, {date: date, calories: 0});
		});
		console.log('weekData', weekData);
		// Append template html
		weekData.forEach(function(dayData) {
			console.log('processeing weekday data', dayData);
			var template = $('#week-day-template').html();
			console.log('template', template);
			var tag;
			switch (dayData.date.getDay()) {
				case 0:
					tag = $('#sunday');
					dayData.name = "Sunday";
					break;
				case 1:
					tag = $('#monday');
					dayData.name = "Monday";
					break;
				case 2:
					tag = $('#tuesday');
					dayData.name = "Tuesday";
					break;
				case 3:
					tag = $('#wednesday');
					dayData.name = "Wednesday";
					break;
				case 4:
					tag = $('#thursday');
					dayData.name = "Thursday";
					break;
				case 5:
					tag = $('#friday');
					dayData.name = "Friday";
					break;
				case 6:
					tag = $('#saturday');
					dayData.name = "Saturday";
					break;
			}
			var html = _.template(template)(dayData);
			console.log('html', html);
			console.log('tag', tag);
			tag.html(html);
		});
		return this;
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

consumptionHistoryForDate = function(date) {
	var filtered = app.ConsumptionHistory.filter(function(model) {
		return datesMatch(model.get("date"), date);
	});
	return filtered;
};

filteredCollectionForDay = function(collection, date) {
	return collection.models.filter(function(item) {
		return datesMatch(date, item.get('date'));
	}, this);
};

// ArticleView
app.ArticleView = Backbone.View.extend({
	tagName: 'li',

	template : _.template($('#article-template').html()),

	initialize : function() {
		_.bindAll(this, 'render');
		this.render();
	},

	render : function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

// ArticleListView
app.ArticleListView = Backbone.View.extend({
	el : $('#article-list'),

	initialize : function() {
		_.bindAll(this, 'render', 'request');

		// app.ConsumptionHistory.on('add', this.render);
	},

	render : function() {
		// Request articles from NYTimes
		this.request();
		return this;
	},

	request : function() {
		var self = this;
		$('ul', self.el).html('');
		$.getJSON('http://api.nytimes.com/svc/search/v2/articlesearch.json?q=""' + 
			'")&api-key=a40e519f6eef4efd9bdbf97fcec6af22:19:61005771&fq=news_desk:("Food" "Health")', function(data) {
				console.log('data', data);
				var hits = data.response.meta.hits;
				console.log(hits);
				var articlesToTake = Math.min(hits, 5);
				for (var i = 0; i < articlesToTake; i++) {
					var article = data.response.docs[i];
					var headline = article.headline.main;
					var url = article.web_url;
					var snippet = article.snippet;
					var articleModel = new app.Article({
						headline : headline,
						url : url,
						snippet: snippet
					});
					var articleView = new app.ArticleView({model: articleModel});
					$('ul', self.$el).append(articleView.render().el);
				}
		})
	}
})

// RecipeView
app.RecipeView = Backbone.View.extend({
	tagName: 'li',

	template : _.template($('#recipe-template').html()),

	initialize : function() {
		_.bindAll(this, 'render');
		this.render();
	},

	render : function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

// RecipeListView
app.RecipeListView = Backbone.View.extend({
	el : $('#recipe-list'),

	initialize : function() {
		_.bindAll(this, 'render', 'request');
	},

	render : function() {
		this.request();
		return this;
	},

	request : function() {
		var self = this;
		$('ul', self.el).html('');
		$.ajax({
			url : 'http://food2fork.com/api/search?key=623ea969c56dc75bd5e217313b50b7d7&sort=t', 
			success : function(data) {
				console.log('success');
				var count = data.count;
				var recipesToTake = Math.min(count, 5);
				for (var i = 0; i < recipesToTake; i++) {
					var recipe = data.recipes[i];
					var title = recipe.title;
					var url = recipe.source_url ? recipe.source_url : f2f_url;
					var rank = recipe.social_rank;
					var recipeModel = new Recipe({
						title : title,
						url : url,
						rank : rank
					})
					var recipeView = new RecipeView({model: recipeModel});
					$('ul', self.$el).append(articleView.render().el);
				}
			},
			dataType: 'json',
			error : function(xhr, status, error) {
				console.log('error', xhr.responseText);
			}
		});
	},

	recipeResult : function(data) {
		console.log('success');
	}


})

// Connect app logic to the DOM
$(function() {
	new app.AppView();
});