// router

// Check what day is current
var app = app || {};

app.DayFilterRouter = Backbone.Router.extend({
	routes: {':year/:month/:day' : "setDate"},

	setDate : function(year, month, day) {
		app.config.set({currentDate: new Date(year, month - 1, day - 1)});
	}
})

app.DayFilter = new app.DayFilterRouter();
Backbone.history.start();