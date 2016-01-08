// $('#food-search').select2();

$('#food-search').select2({
  ajax: {
    url: function(params) {
      var url = 'https://api.nutritionix.com/v1_1/search/' + (params.term ? params.term : '');
      return url;
    },
    dataType: 'json',
    delay: 250,
    data: function (params) {
      return {
        // results: resultRangeForPage(params.page ? params.page : 0, 15),
        appId: '0b6341e3',
        appKey: '8e568e8713b5c153220709a08b308919',
        fields: 'item_name,nf_calories,nf_total_fat,nf_saturated_fat,nf_monounsaturated_fat,nf_polyunsaturated_fat,nf_trans_fatty_acid,nf_total_carbohydrate,nf_dietary_fiber,nf_sugars,nf_protein,nf_serving_size_qty,nf_serving_size_unit'
      };
    },
    processResults: function (data, params) {
      // Clear FoodSearchList if page is 1 or undefined

      data.hits.forEach(function(item) {
        // Make ID for each food item
        item.id = app.config.get('currentDate').getTime() + item._id;
      })
      // parse the results into the format expected by Select2
      // since we are using custom formatting functions we do not need to
      // alter the remote JSON data, except to indicate that infinite
      // scrolling can be used
      params.page = params.page || 1;
      return {
        results: data.hits,
        pagination: {
          more: (params.page * 15) < data.total_hits
        }
      };
    },
    cache: true
  },
  placeholder: 'Food lookup',
  escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
  minimumInputLength: 1,
  templateResult: formatFood,
  templateSelection: formatFoodSelection
});

// $('#food-search').on("select2:select", function (e) { console.log($('#food-search').select2('data')); });

function formatFood (food) {
  if (!food.id || food.loading) return food.text;
  var currentDate = app.config.get('currentDate');

  var foodItem = new app.FoodItem({
    id : food.id,
    date : app.config.get('currentDate'),
    name : food.fields.item_name,
    calories : food.fields.nf_calories,
    fat : food.fields.nf_total_fat,
    saturatedFat : food.fields.nf_saturated_fat,
    monounsaturatedFat : food.fields.nf_monounsaturated_fat,
    polyunsaturatedFat : food.fields.nf_polyunsaturated_fat,
    carbohydrates : food.fields.nf_total_carbohydrate,
    dietaryFiber : food.fields.nf_dietary_fiber,
    sugar : food.fields.nf_sugars,
    protein : food.fields.nf_protein,
    quantity : food.fields.nf_serving_size_qty,
    unit : food.fields.nf_serving_size_unit,
  });
  console.log(foodItem);
  app.FoodSearchList.add(foodItem);
  var markup = new app.ResultFoodView({model: foodItem}).render().el;

  return markup;
}

function formatFoodSelection (food) {
  // if (!food.id) return food.text;
  // return food.fields.item_name;
  return 'Food Lookup';
}

function resultRangeForPage(page, rpp) {
  return page * rpp + ':' + (page * rpp + rpp);
}