// Select2 Box

$('#food-search').select2({    
    // Retrieve info from Nutritionix API to display in select box
    ajax: {
        url: function(params) {
            var url = 'https://api.nutritionix.com/v1_1/search/' + (params.term ? params.term : '');
            return url;
        },
        dataType: 'json',
        delay: 250,
        data: function (params) {
            return {
                results: params.page ? resultRangeForPage(params.page, 15) : ('0:' + 15),
                appId: '0b6341e3',
                appKey: '8e568e8713b5c153220709a08b308919',
                fields: 'item_name,nf_calories,nf_total_fat,nf_saturated_fat,nf_monounsaturated_fat,nf_polyunsaturated_fat,nf_trans_fatty_acid,nf_total_carbohydrate,nf_dietary_fiber,nf_sugars,nf_protein,nf_serving_size_qty,nf_serving_size_unit'
            };
        },
        processResults: function (data, params) {
          data.hits.forEach(function(item) {
            // Make ID for each food item
            item.id = app.config.get('currentDate').getTime() + item._id;
          });
          params.page = params.page || 1;
          return {
            results: data.hits,
            pagination: {
                more: (params.page * 15) < data.total_hits
            }
          };
        },
        error: function(xhr, status, error){
            // Display error message
            $('#food-search-err-msg').remove();
            $('#select2-food-search-results').prepend('<span id="food-search-err-msg" style="color: red; padding-left: 5px">Error retrieving food search results</span>');
        },
        success: function() {
            // Remove any error message on success
            $('#food-search-err-msg').remove();
        },
        cache: true
    },
    placeholder: 'Search for food to record',
    escapeMarkup: function (markup) { 
        return markup; 
    },
    minimumInputLength: 1,
    templateResult: formatFood,
    templateSelection: formatFoodSelection
});

// Function callback to format data to be displayed in select box
function formatFood (food) {
    if (!food.id || food.loading) return food.text;

    var foodItem = new app.FoodItem({
        id : food.id,
        dateTime : app.config.get('currentDate').getTime(),
        name : food.fields.item_name,
        calories : food.fields.nf_calories,
        fat : food.fields.nf_total_fat,
        saturatedFat : food.fields.nf_saturated_fat,
        monounsaturatedFat : food.fields.nf_monounsaturated_fat,
        polyunsaturatedFat : food.fields.nf_polyunsaturated_fat,
        transFat : food.fields.nf_trans_fatty_acid,
        carbohydrates : food.fields.nf_total_carbohydrate,
        dietaryFiber : food.fields.nf_dietary_fiber,
        sugar : food.fields.nf_sugars,
        protein : food.fields.nf_protein,
        quantity : food.fields.nf_serving_size_qty,
        unit : food.fields.nf_serving_size_unit,
    });
    app.FoodSearchList.add(foodItem);
    var markup = new app.ResultFoodView({model: foodItem}).render().el;

    return markup;
}

// Function callback to format how a selection should be displayed in the box.  This is ignored in the app.
function formatFoodSelection (food) {
    return 'Search for food to record';
}

// Utility function to get appropriate page results from API
function resultRangeForPage(page, rpp) {
    return page * rpp + ':' + (page * rpp + rpp);
}