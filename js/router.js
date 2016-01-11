// Router

// When the app's currentDate changes, the URL will change
// When a URL with a route in it is opened, the app's
// currentDate will be modified to be that date.
var app = app || {};

app.DayFilterRouter = Backbone.Router.extend({
	routes: {':year/:month/:day' : "setDate"},

	setDate : function(year, month, day) {
		app.config.set({currentDate: new Date(year, month - 1, day)});
	}
});

app.DayFilter = new app.DayFilterRouter();
Backbone.history.start();