// Override Settings
var bcSfFilterSettings = {
  general: {
    limit: 10,
    /* Optional */
    // loadProductFirst: true,
  }
};

// Declare Templates
var bcSfFilterTemplate = {
  'soldOutClass': 'sold-out',
  'saleClass': 'on-sale',
  'soldOutLabelHtml': '<div>' + bcSfFilterConfig.label.sold_out + '</div>',
  'saleLabelHtml': '<div>' + bcSfFilterConfig.label.sale + '</div>',
  'vendorHtml': '<div>{{itemVendorLabel}}</div>',

  // Grid Template
  'productGridItemHtml': '<div class="col-lg-6">' +
  '<div class="card">' +
  '<div class="product-box from_filter">' +
  '<div class="image">' +
  '<a href="{{itemUrl}}">' +
  '<img class="" src="{{itemThumbUrl}}" alt="{{itemTitle}}">' +
  '</a>' +
  '</div>' +
  '<h2><a href="{{itemUrl}}">{{itemTitle}}</a></h2>'+
  '<form method="post" action="/cart/add" id="{{itemId}}" accept-charset="UTF-8" class="product-form AddToCartForm" enctype="multipart/form-data" novalidate="novalidate" data-product-form="" data-product-form-redirect-url="/cart">' +
  '<input type="hidden" name="form_type" value="product">' +
  '<input type="hidden" name="utf8" value="✓">' +
  '<p class="card-text money">{{itemPrice}}</p>' +
  '<div class="product-box-select">' +     
  '<div class="select-dropdown">' +
  '<select class="form-control" name="quantity">' +
  '<option>1</option>' +
  '<option>2</option>' +
  '<option>3</option>' +
  '<option>4</option>' +
  '<option>5</option>' +
  '</select>' +
  '</div>' +
  '<input type="hidden" name="id" value="{{firstVariant}}">'+
  '<div class="select-dropdown-flavor">' +
  '{{flavorHtml}}' +
  '</div>' +
  '</div>' +
  '<div class="cart-button 123">' +
  '{{addToCartButtonHtml}}'+
  '</div>' +
  '<div class="text-link">' +
  '<a href="{{itemUrl}}">LEARN MORE</a>'+
  '</div>' +
  '</form>' +
  '</div>' +
  '</div>' +    
  '</div>',

  // Pagination Template
  'previousActiveHtml': '<li><a href="{{itemUrl}}">&larr;</a></li>',
  'previousDisabledHtml': '<li class="disabled"><span>&larr;</span></li>',
  'nextActiveHtml': '<li><a href="{{itemUrl}}">&rarr;</a></li>',
  'nextDisabledHtml': '<li class="disabled"><span>&rarr;</span></li>',
  'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
  'pageItemSelectedHtml': '<li><span class="active">{{itemTitle}}</span></li>',
  'pageItemRemainHtml': '<li><span>{{itemTitle}}</span></li>',
  'paginateHtml': '<ul class="list--inline pagination">{{previous}}{{pageItems}}{{next}}</ul>',

  // Sorting Template
  'sortingHtml': '<label class="label--hidden">' + bcSfFilterConfig.label.sorting + '</label><select class="collection-sort__input">{{sortingItems}}</select>',
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
  if(data.product_type != 'FREEGIFT_HIDDEN'){
    /*** Prepare data ***/
    var images = data.images_info;
    // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0].id;
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;
    itemHtml = itemHtml.replace(/{{firstVariant}}/g, firstVariant);
    if (getParam('variant') !== null && getParam('variant') != '') {
      var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
      for (var i = 0; i < data['variants'].length; i++) {
        if (data['variants'][i].available) {
          firstVariant = data['variants'][i];
          break;
        }
      }
    }
    /*** End Prepare data ***/


    // Get Template


    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Price
    var itemPriceHtml = '';
    if (data.title != '')  {
      itemPriceHtml += '<p class="grid-link__meta">';
      if (onSale) {
        itemPriceHtml += '<s class="grid-link__sale_price">' + this.formatMoney(data.compare_at_price_min) + '</s> ';
      }
      if (priceVaries) {
        itemPriceHtml += '<span class="bc-sf-filter-product-item-regular-price">' + bcsffilter.formatMoney(data.price_min) + '</span>'
      } else {
        itemPriceHtml += this.formatMoney(data.price_min);
      }
      itemPriceHtml += '</p>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add soldOut class
    var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass);

    // Add onSale class
    var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass);

    // Add soldOut Label
    var itemSoldOutLabelHtml = soldOut ? bcSfFilterTemplate.soldOutLabelHtml : '';
    // console.log(itemSoldOutLabelHtml);
    console.log(soldOut);
    console.log("itemSoldOutLabelHtml");

    var addToCartButton = '';
    if(soldOut == true){
      addToCartButton += '<button type="submit" class="btn" value="Sold Out" disabled>Sold Out</button>';
    }else{
      addToCartButton += '<button type="submit" class="btn" value="Add to cart">Add to cart</button>';
    }

    itemHtml = itemHtml.replace(/{{addToCartButtonHtml}}/g, addToCartButton);

    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabelHtml);

    // Add onSale Label
    var itemSaleLabelHtml = onSale ? bcSfFilterTemplate.saleLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);

    var trimmed = data.json.url.substring(1);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, trimmed);


    var flavor_images_wrap = data.options_with_values;
    var flavor_images = {};
    var flavorVar = 0;
    for (var i = flavor_images_wrap.length - 1; i >= 0; i--) {

      if(flavor_images_wrap[i].name == flavor_images_wrap[i].name) {
        flavorVar = i+1;
        flavor_images = flavor_images_wrap[i];
      }
    }


    var flavor_images_flag = true;
    for(var key in flavor_images) {
      if(flavor_images.hasOwnProperty(key))
        flavor_images_flag = false;
    }
    var flavorHtml = '';
    var selected = '';
    var selectedVar = -1;
    var is_available = false;
    for (var i = 0; i < data.variants.length; i++) {
      if(flavorVar == 1) {
        if(data.variants[i].option2 == data.variants[0].option2 && data.variants[i].option3 == data.variants[0].option3 && !soldOut) {

          if(!is_available){
            is_available = true;
            flavorHtml += '<select class="form-control flavor" name="id">';
          }
          if(data.variants[i].available) {
            flavorHtml += '<option value="'+data.variants[i].id+'">'+data.variants[i].option1+'</option>';
          } else {
            flavorHtml += '<option value="'+data.variants[i].id+'" disabled="disabled">'+data.variants[i].option1+'</option>';
          }
        }
      }
    }
    if(is_available){
      flavorHtml += '</select>';
    }

    var itemHtml = itemHtml.replace(/{{flavorHtml}}/g, flavorHtml);

    return itemHtml;
  }
};

// Build Product List Item
BCSfFilter.prototype.buildProductListItem = function(data) {

  itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));
  return itemHtml;
  // // Add Description
  // var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
  // // Truncate by word
  // itemDescription = (itemDescription.split(" ")).length > 51 ? itemDescription.split(" ").splice(0, 51).join(" ") + '...' : itemDescription.split(" ").splice(0, 51).join(" ");
  // // Truncate by character
  // itemDescription = itemDescription.length > 350 ? itemDescription.substring(0, 350) + '...' : itemDescription.substring(0, 350);
  // itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);
};

// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
  for (var k in data) {
    // Add Options
    var optionsArr = [];
    for (var i in data[k]['options_with_values']) {
      optionsArr.push(data[k]['options_with_values'][i]['name']);
    }
    data[k]['options'] = optionsArr;

    // Customize variants
    for (var i in data[k]['variants']) {
      var variantOptionArr = [];
      var count = 1;
      var variant = data[k]['variants'][i];
      // Add Options
      var variantOptions = variant['merged_options'];
      if (Array.isArray(variantOptions)) {
        for (var j = 0; j < variantOptions.length; j++) {
          var temp = variantOptions[j].split(':');
          data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
          data[k]['variants'][i]['option_' + temp[0]] = temp[1];
          variantOptionArr.push(temp[1]);
        }
        data[k]['variants'][i]['options'] = variantOptionArr;
      }
      data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
      data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
    }

    // Add Description
    data[k]['description'] = data[k]['body_html'];
  }
  return data;
};

/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
  if (this.getSettingValue('general.paginationType') == 'default') {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
      jQ(this.selector.bottomPagination).html('');
      return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
      var paginationHtml = bcSfFilterTemplate.paginateHtml;

      // Build Previous
      var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
      previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
      paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

      // Build Next
      var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
      nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
      paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

      // Create page items array
      var beforeCurrentPageArr = [];
      for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
        beforeCurrentPageArr.unshift(iBefore);
      }
      if (currentPage - 4 > 0) {
        beforeCurrentPageArr.unshift('...');
      }
      if (currentPage - 4 >= 0) {
        beforeCurrentPageArr.unshift(1);
      }
      beforeCurrentPageArr.push(currentPage);

      var afterCurrentPageArr = [];
      for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
        afterCurrentPageArr.push(iAfter);
      }
      if (currentPage + 3 < totalPage) {
        afterCurrentPageArr.push('...');
      }
      if (currentPage + 3 <= totalPage) {
        afterCurrentPageArr.push(totalPage);
      }

      // Build page items
      var pageItemsHtml = '';
      var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
      for (var iPage = 0; iPage < pageArr.length; iPage++) {
        if (pageArr[iPage] == '...') {
          pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
        } else {
          pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
        }
        pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
        pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
      }
      paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

      jQ(this.selector.bottomPagination).html(paginationHtml);
    }
  }
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
  if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
    jQ(this.selector.topSorting).html('');

    var sortingArr = this.getSortingList();
    if (sortingArr) {
      // Build content 
      var sortingItemsHtml = '';
      for (var k in sortingArr) {
        sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
      }
      var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      jQ(this.selector.topSorting).html(html);

      // Set current value
      jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
    }
  }
};

// Build Display type (List / Grid / Collage)
// BCSfFilter.prototype.buildFilterDisplayType = function() {
//     var itemHtml = '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="change-view bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><i class="fa fa-th" aria-hidden="true"></i><span class="fallback-text">Grid view</span></span></a>';
//     itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="change-view bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><i class="fa fa-list" aria-hidden="true"></i><span class="fallback-text">List view</span></span></a>';
//     jQ(this.selector.topDisplayType).html(itemHtml);

//     // Active current display type
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
//     if (this.queryParams.display == 'list') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
//     } else if (this.queryParams.display == 'grid') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
//     }
// };

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {};


BCSfFilter.prototype.buildDefaultElements=function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};

function customizeJsonProductData(data) {for (var i = 0; i < data.variants.length; i++) {var variant = data.variants[i];var featureImage = data.images.filter(function(e) {return e.src == variant.image;});if (featureImage.length > 0) {variant.featured_image = {"id": featureImage[0]['id'],"product_id": data.id,"position": featureImage[0]['position'],"created_at": "","updated_at": "","alt": null,"width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id]}} else {variant.featured_image = '';};};var self = bcsffilter;var itemJson = {"id": data.id,"title": data.title,"handle": data.handle,"vendor": data.vendor,"variants": data.variants,"url": self.buildProductItemUrl(data),"options_with_values": data.options_with_values,"images": data.images,"images_info": data.images_info,"available": data.available,"price_min": data.price_min,"price_max": data.price_max,"compare_at_price_min": data.compare_at_price_min,"compare_at_price_max": data.compare_at_price_max};return itemJson;};
BCSfFilter.prototype.prepareProductData = function(data) {var countData = data.length;for (var k = 0; k < countData; k++) {data[k]['images'] = data[k]['images_info'];if (data[k]['images'].length > 0) {data[k]['featured_image'] = data[k]['images'][0]} else {data[k]['featured_image'] = {src: bcSfFilterConfig.general.no_image_url,width: '',height: '',aspect_ratio: 0}}data[k]['url'] = '/products/' + data[k].handle;var optionsArr = [];var countOptionsWithValues = data[k]['options_with_values'].length;for (var i = 0; i < countOptionsWithValues; i++) {optionsArr.push(data[k]['options_with_values'][i]['name'])}data[k]['options'] = optionsArr;if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) {var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim();function updateMultiCurrencyPrice(oldPrice, newPrice) {if (typeof newPrice != 'undefined') {return newPrice;}return oldPrice;}data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]);data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]);data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]);data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]);}data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100;data[k]['price'] = data[k]['price_min'];data[k]['compare_at_price'] = data[k]['compare_at_price_min'];data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max'];var firstVariant = data[k]['variants'][0];if (getParam('variant') !== null && getParam('variant') != '') {var paramVariant = data[k]['variants'].filter(function(e) {return e.id == getParam('variant')});if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0]} else {var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {if (data[k]['variants'][i].available) {firstVariant = data[k]['variants'][i];break}}}data[k]['selected_or_first_available_variant'] = firstVariant;var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {var variantOptionArr = [];var count = 1;var variant = data[k]['variants'][i];var variantOptions = variant['merged_options'];if (Array.isArray(variantOptions)) {var countVariantOptions = variantOptions.length;for (var j = 0; j < countVariantOptions; j++) {var temp = variantOptions[j].split(':');data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];data[k]['variants'][i]['option_' + temp[0]] = temp[1];variantOptionArr.push(temp[1])}data[k]['variants'][i]['options'] = variantOptionArr}data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100}data[k]['description'] = data[k]['content'] = data[k]['body_html'];if (data[k].hasOwnProperty('original_tags') && data[k]['original_tags'].length > 0) {data[k]['tags'] = data[k]['original_tags'].slice(0);}data[k]['json'] = customizeJsonProductData(data[k]);}return data;};
/* Begin patch boost-010 run 2 */
BCSfFilter.prototype.initFilter=function(){return this.isBadUrl()?void(window.location.href=window.location.pathname):(this.updateApiParams(!1),void this.getFilterData("init"))},BCSfFilter.prototype.isBadUrl=function(){try{var t=decodeURIComponent(window.location.search).split("&"),e=!1;if(t.length>0)for(var i=0;i<t.length;i++){var n=t[i],a=(n.match(/</g)||[]).length,r=(n.match(/>/g)||[]).length,o=(n.match(/alert\(/g)||[]).length,h=(n.match(/execCommand/g)||[]).length;if(a>0&&r>0||a>1||r>1||o||h){e=!0;break}}return e}catch(l){return!0}};
/* End patch boost-010 run 2 */
