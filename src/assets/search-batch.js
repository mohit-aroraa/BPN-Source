waitFor_jQuery(function () {
  jQuery(document).ready(function ($) {

    //Batch code searching
    $('body').on('click', '.search-batch-file', function () {

      var apitoken = 'BPNhjhvasdvas8871238';
      var batch_code = $('.batch-code').val();
      if (batch_code == undefined || batch_code == '') {
        // $('.batch-error').text('Batch number is required');
        // return false;
      } else {
        console.log(batch_code)
        $('.loader').show();
        $.ajax({
          type: "GET",
          url: "https://thebarestandard.com/public/api/batchs",
          headers: {
            'Access-Control-Allow-Origin': 'https://www.bareperformancenutrition.com/',
            'Content-Type': 'application/json'
          },
          data: {search: batch_code, api_token: apitoken},
          dataType: 'json',
          //         crossDomain: true,
          success: function (response) {
            console.log(response, response.status_code);
            if (response.status_code == 200) {
              console.log(response, response.batch_file_path);
              $('.batch-error').text('').addClass('hide');
              $('.batchpdf').attr('href', response.batch_file_path).removeClass('hide');
            } else if (response.status_code == 404) {
              $('.batchpdf').attr('href', '').addClass('hide');
              $('.batch-error').text(response.message).removeClass('hide');
            }
            $('.loader').hide();
          }
        });
      }
    });

    //remove file when empty search
    //   $('body').on('keyup','.batch-code',function() {
    //     var apitoken = 'BPNhjhvasdvas8871238';
    //     var batch_code = $('.batch-code').val();
    //     if (batch_code == undefined || batch_code == '') {
    //  		$('.batchpdf').attr('href','').addClass('hide');
    //        $('.batch-error').text('').addClass('hide');
    //     }else{

    //     }
    //   });
  });
});
