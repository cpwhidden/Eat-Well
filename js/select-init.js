$('#food-search').select2({
  ajax: {
    url: function(params) {
      console.log(params);
      var url = 'https://api.nutritionix.com/v1_1/search/' + (params.term ? params.term : '');
      console.log(url);
      return url;
    },
    dataType: 'json',
    delay: 100,
    data: function (params) {
      return {
        results: resultRangeForPage(params.page ? params.page : 0, 15),
        appId: '0b6341e3',
        appKey: '8e568e8713b5c153220709a08b308919',
        fields: 'item_name,nf_calories,nf_total_fat,nf_saturated_fat,nf_monounsaturated_fat,nf_polyunsaturated_fat,nf_trans_fatty_acid,nf_total_carbohydrate,nf_dietary_fiber,nf_sugars,nf_protein,nf_serving_size_qty,nf_serving_size_unit,images_front_full_url'
      };
    },
    processResults: function (data, params) {
      console.log(data);
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

function formatFood (food) {
  console.log(food);
  if (food.loading) return food.item_name;

  // var markup = "<div class='select2-result-repository clearfix'>" +
  //              "<div class='select2-result-repository__avatar'><img src='" + food.images_front_full_url + "' /></div>" +
  //   "<div class='select2-result-repository__meta'>" +
  //     "<div class='select2-result-repository__title'>" + repo.full_name + "</div>";

  // if (repo.description) {
  //   markup += "<div class='select2-result-repository__description'>" + repo.description + "</div>";
  // }

  // markup += "<div class='select2-result-repository__statistics'>" +
  //   "<div class='select2-result-repository__forks'><i class='fa fa-flash'></i> " + repo.forks_count + " Forks</div>" +
  //   "<div class='select2-result-repository__stargazers'><i class='fa fa-star'></i> " + repo.stargazers_count + " Stars</div>" +
  //   "<div class='select2-result-repository__watchers'><i class='fa fa-eye'></i> " + repo.watchers_count + " Watchers</div>" +
  // "</div>" +
  // "</div></div>";
  var foodItem = new app.FoodItem({
    date : app.currentDate,
    name : food.fields.item_name,
    calories : food.fields.nf_calories,
    totalFat : food.fields.nf_total_fat,
    saturatedFat : food.fields.nf_saturated_fat,
    monounsaturatedFat : food.fields.nf_monounsaturated_fat,
    polyunsaturatedFat : food.fields.nf_polyunsaturated_fat,
    carbohydrates : food.fields.nf_total_carbohydrate,
    dietaryFiber : food.fields.nf_dietary_fiber,
    sugar : food.fields.nf_sugars,
    protein : food.fields.nf_protein,
    quantity : food.fields.nf_serving_size_qty,
    unit : food.fields.nf_serving_size_unit
  });
  var markup = new app.ResultFoodView({model: foodItem}).render().el;

  return markup;
}

function formatFoodSelection (food) {
  return food.item_name;
}

function resultRangeForPage(page, rpp) {
  console.log(page);
  console.log(rpp);
  return page * rpp + ':' + (page * rpp + rpp);
}