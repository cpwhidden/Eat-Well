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
		this.dayChartView = new app.ChartView('day-chart-graphic', filteredCollectionForDay);
		this.weekChartView = new app.ChartView('week-chart-graphic', filteredCollectionForWeek);
		this.monthChartView = new app.ChartView('month-chart-graphic', filteredCollectionForMonth);
		this.render();
	},

	dateChanged : function() {
		console.log(app.config.get('currentDate'));
		app.DayFilter.navigate(app.config.get('currentDate').getFullYear() + '/' + 
							  (app.config.get('currentDate').getMonth() + 1) + '/' + 
							  (app.config.get('currentDate').getDate()), {trigger: false});
		this.render();
	},

	render : function() {
		this.dayView.render();
		this.weekView.render();
		this.articleListView.render();
		this.recipeListView.render();
		this.dayChartView.update();
		this.weekChartView.update();
		this.monthChartView.update();
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
		// Get dates for all days of currentDate week
		var dates = this.weekDatesForDate(app.config.get("currentDate"));
		// Find aggregrate calorie info for each day
		var weekData = dates.map(function(date){
			return consumptionHistoryForDate(date).reduce(function(previousValue, currentValue) {
				return {date: previousValue.date, calories : (previousValue.calories + currentValue.get("calories"))};
			}, {date: date, calories: 0});
		});
		// Append template html
		weekData.forEach(function(dayData) {
			var template = $('#week-day-template').html();
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
		console.log(newDate);
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

weeksMatch = function(date1, date2) {
	console.log(date1, date2);
	return date1.getFullYear() == date2.getFullYear() 
		&& date1.getMonth() == date2.getMonth()
		&& (date1.getDay() - date2.getDay()) == (date1.getDate() - date2.getDate());
};

filteredCollectionForWeek = function(collection, date) {
	return collection.models.filter(function(item) {
		return weeksMatch(date, item.get('date'));
	}, this);
};

monthsMatch = function(date1, date2) {
	return date1.getFullYear() == date2.getFullYear() 
		&& date1.getMonth() == date2.getMonth();
};

filteredCollectionForMonth = function(collection, date) {
	return collection.models.filter(function(item) {
		return monthsMatch(date, item.get('date'))
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
				$('#articles-attribution').html('<img src="assets/images/poweredby_nytimes_200c.png">');
				var hits = data.response.meta.hits;
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
		$('ul', this.$el).html('');
		return this;
	},

	request : function() {
		var self = this;
		$.ajax({
			method: 'GET',
			dataType: 'json',
			data: {
				_app_id : 'caac23f0',
				_app_key : '4b5b4fa135b838484e0c7a3fe96254ca',
				maxResult : 10,
				start : 0
			},
			url: 'https://api.yummly.com/v1/api/recipes', 
			success: function(data, status, response) {
				$('#recipes-attribution').html(data.attribution.html);
				var count = data.matches.length;
				var recipesToTake = Math.min(count, 10);
				for (var i = 0; i < recipesToTake; i++) {
					var recipe = data.matches[i];
					var title = recipe.recipeName;
					var url = 'http://www.yummly.com/recipe/' + recipe.id;
					var rating = recipe.rating;
					var recipeModel = new app.Recipe({
						title : title,
						url : url,
						rating : rating
					});
					var recipeView = new app.RecipeView({model: recipeModel});
					$('ul', self.$el).append(recipeView.render().el);
				}
			},
		});
	}
});

// ChartView
app.ChartView = Backbone.View.extend({
	collection: app.ConsumptionHistory,

	initialize : function(elementID, filter) {
		console.log('init chart view');
		_.bindAll(this, 'render', 'update', 'getData', 'width', 'height', 'circleCenterX', 'circleCenterY');
		this.el = document.getElementById(elementID);
		this.margin = 50;
		this.recommendedCalories = 2000;
		this.paper = Raphael(document.getElementById(elementID), this.width(), this.height());
		this.paper.customAttributes.arc = this.pieArc;
		this.strokeWidth = 20;
		this.filter = filter;
		this.state = 0;  // Current drawing state of the graphic, used for animation transitions
		this.collection.bind('change add remove', this.update);
		this.render();
	},

	render : function() {
		var data = this.getData();
		var totalGrams = data.carbohydrates + data.fat + data.protein;
		console.log('data', data);
		this.radius = Math.min(this.width() / 2, this.height() / 2);
		console.log('radius', this.radius);
		this.circle = this.paper.circle(this.width() / 2, this.height() / 2, this.radius);
		this.circle.attr({
			'fill': '#D80',
			'stroke': '',
			'opacity': 0.2 + data.calories / this.recommendedCalories / 0.8,
		});
		console.log('circle center', this.circleCenterX(), this.circleCenterY());
		this.text = this.paper.text(this.width() / 2, this.height() / 2 - 10, data.calories.toFixed(0) + '\ncalories');
		this.text.attr({'font-family' : 'sans-serif', 'font-size' : 40, 'font-weight' : 300, 'fill' : '#fff'});
		console.log(this.height(), this.radius, this.margin, this.strokeWidth);
		this.carbohydrates = this.paper.path().attr({
			'stroke': '#F55',
			'stroke-width': this.strokeWidth, 
			'stroke-linecap': 'round',
			'arc' : [this.circleCenterX(), this.circleCenterY(), 0, data.carbohydrates, totalGrams, this.radius - this.strokeWidth / 2]
		});
		this.fat = this.paper.path().attr({
			'stroke': '#55F',
			'stroke-width': this.strokeWidth,
			'stroke-linecap': 'round',
			'arc': [this.circleCenterX(), this.circleCenterY(), data.carbohydrates, data.fat , totalGrams, this.radius - this.strokeWidth / 2]
		});
		console.log('carbo', this.carbohydrates);
		this.protein = this.paper.path().attr({
			'stroke': '#5F5',
			'stroke-width': this.strokeWidth,
			'stroke-linecap': 'round',
			'arc': [this.circleCenterX(), this.circleCenterY(), data.carbohydrates + data.fat, data.protein, totalGrams, this.radius - this.strokeWidth / 2]
		});

		// this.carbohydrates = this.paper.path('M' + (this.width() / 2) + ', ' + (((this.height() - (this.radius * 2)) / 2) + (this.strokeWidth / 2) ) + ' A' + (this.radius - this.strokeWidth / 2) + ',' + (this.radius - this.strokeWidth / 2) + ' 0 0,0 ' + (this.strokeWidth / 2) + ',' + (this.height() / 2));
		// this.carbohydrates.attr({'stroke': '#F55', 'stroke-width': this.strokeWidth, 'stroke-linecap': 'round'});
		this.toggleVisibility(data);
	},

	toggleVisibility : function(data) {
		if (!data.carbohydrates && !data.fat && !data.protein) {
			this.carbohydrates.hide();
			this.fat.hide();
			this.protein.hide();	
		} else {
			this.carbohydrates.show();
			this.fat.show();
			this.protein.show();
		}
	},

	pieArc : function(xCenter, yCenter, preceedingTotal, value, totalValue, radius) {
		console.log('pieArc params', xCenter, yCenter, preceedingTotal, value, totalValue, radius);
		var startingDegreeAngle = -90 - 360 * preceedingTotal / totalValue;
		var degreeAngle = -360 * value / totalValue;
		var startingRadians = startingDegreeAngle * Math.PI / 180;
		var radians = degreeAngle * Math.PI / 180;
		if (value == totalValue) {
			return {
				path: [['M', xCenter, yCenter - radius],
						['A', radius, radius, 0, 1, 0, xCenter - 0.001, yCenter - radius]]
			};
		} else {
			var sourceX = xCenter + radius * Math.cos(startingRadians);
			var sourceY = yCenter + radius * Math.sin(startingRadians);
			console.log('source x y', sourceX, sourceY);
			var destinationX = xCenter + radius * Math.cos(startingRadians + radians);
			var destinationY = yCenter + radius * Math.sin(startingRadians + radians);
			console.log('destination x y', destinationX, destinationY);
			console.log(radians);
			console.log(degreeAngle);
			console.log(Math.sin(radians));
			var path = {
				path: [['M', sourceX, sourceY],
						['A', radius, radius, 0, ((value / totalValue) > 0.5 ? 1 : 0), 0, destinationX, destinationY]]
			};
			console.log('path', path);
			return path;
		}
	},

	width : function() {
		return $(this.el).width() - this.margin;
	},

	height : function() {
		return $(this.el).height() - this.margin;
	},

	circleCenterX : function() {
		return this.width() / 2;
	},

	circleCenterY: function() {
		return this.height() / 2;
	},

	update : function() {
		var ms = 750;
		var data = this.getData();
		var totalGrams = data.carbohydrates + data.fat + data.protein;
		this.text.attr('text', data.calories.toFixed(0) + '\ncalories');
		this.circle.animate({'opacity': 0.2 + data.calories / this.recommendedCalories / 0.8}, ms, 'elastic');
		this.carbohydrates.animate({'arc': [this.circleCenterX(), this.circleCenterY(), 0, data.carbohydrates, totalGrams, this.radius - this.strokeWidth / 2]}, ms, 'elastic');
		this.fat.animate({'arc': [this.circleCenterX(), this.circleCenterY(), data.carbohydrates, data.fat, totalGrams, this.radius - this.strokeWidth / 2]}, ms, 'elastic');
		this.protein.animate({'arc': [this.circleCenterX(), this.circleCenterY(), data.carbohydrates + data.fat, data.protein, totalGrams, this.radius - this.strokeWidth / 2]}, ms, 'elastic');
		this.toggleVisibility(data);
	},

	getData : function() {
		console.log(app.config.currentDate);
		var filteredCollection = this.filter(this.collection, app.config.get('currentDate'));
		console.log('filteredCollection', filteredCollection);
		var data = filteredCollection.reduce(function(previousValue, currentValue) {
			return {calories: previousValue.calories + currentValue.get('calories'), 
				carbohydrates: previousValue.carbohydrates + currentValue.get('carbohydrates'), 
				fat: previousValue.fat + currentValue.get('fat'), 
				protein: previousValue.protein + currentValue.get('protein')};
		}, {calories: 0, carbohydrates: 0, fat: 0, protein: 0});
		console.log('retrieving data', data);
		return data;
	}
})

// Connect app logic to the DOM
$(function() {
	new app.AppView();
});