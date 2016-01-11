# Eat Well

Eat Well is a web application that helps you record food that you have eaten and aggregates useful nutritional information from that, displaying both data and graphs.  It connect to the large Nutritionix API that delivers numerous nutritional facts on common foods and meals.

## Features

* Retrieves API nutritional information from Nutritionix.  Food articles and recipes are retrieved from the New York Times and Yummly APIs, respectively.
* Summary graphs are drawn using Raphael.js
* Monthly calendar is algorithmically drawn using D3.js
* User foods are persisted through Firebase
* Robust Backbone.js architecture
* Flexible Select2 Box for searching and selecting foods
* Grunt used to minify code

## How to use
Open index.html and it’s all there :)
Go to firebase.com to open your own free account to use with the program.  Then replace the url property on the ConsumptionHistory Collection in collection.js to match the URL Firebase will give you (e.g. mywebsite.firebaseio.com).
After editing JavaScript code in the js/src file, build it using grunt.  This repo already contains the Gruntfile.js and package.json necessary.  The node files can be downloaded using the command line: 
```npm install grunt grunt-contrib-uglifyjs --save-dev```

## Credits
* [Nutritionix](https://developer.nutritionix.com)
* [NYTimes](http://developer.nytimes.com)
* [Yummly](https://developer.yummly.com) (Special academic privilege given to use. Thanks!)
* [Select2](https://select2.github.io)
* [Raphael](http://raphaeljs.com)
* [Firebase](https://www.firebase.com)
* [Backbone.js](http://backbonejs.org)
* [Underscore](http://underscorejs.org)
* [jQuery](http://jquery.com)