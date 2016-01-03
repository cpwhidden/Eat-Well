// router

// Check what day is current
var app = app || {};

app.DayFilterRouter = Backbone.Router.extend({
	routes: {':year/:month/:day' : "setDate"},

	setDate : function(year, month, day) {
		app.AppView.currentDate = new Date(year, month, day);
	}
})

app.DayFilter = new app.DayFilterRouter();
Backbone.history.start();