import 'Styles/templates/page.scss';
/**
 * For Search result Page
 */

//Change the Markup for Most Popular section

const isSearchResultPage = document.body.classList.contains(
  'snize-results-page',
)
  ? true
  : false;

function waitForResult(cb) {
  if (
    document.querySelector('.snize-recommendations.snize-horizontal-padding') &&
    document.getElementById('snize_results')
  ) {
    cb();
  } else {
    setTimeout(function () {
      waitForResult(cb);
    }, 50);
  }
}

if (isSearchResultPage) {
  const popularCategoryMarkup = document.createElement('div');
  popularCategoryMarkup.classList.add('popularCategory');
  popularCategoryMarkup.innerHTML = `<h4>POPULAR CATEgORIES</h4>
<div class="popularCategory__links">
  <a href="/collections/best-sellers" class="popularCategory__link">SHOP BEST SELLERS</a>
  <a href="/collections/performance-nutrition" class="popularCategory__link">SHOP SUPPLEMENTS</a>
  <a href="/collections/gear" class="popularCategory__link">SHOP APPAREL & GEAR</a>
</div>`;

  waitForResult(function () {
    const mostPopularDiv = document.querySelector(
      '.snize-recommendations.snize-horizontal-padding',
    );
    const searchResult = document.getElementById('snize_results');

    let count = 0;

    function checkIfNoResult() {
      return document.querySelector('li.snize-no-products-found')
        ? true
        : false;
    }

    let timer = setInterval(() => {
      let isNoResult = checkIfNoResult();
      if (isNoResult || count === 100) {
        clearInterval(timer);
      }
      if (isNoResult) {
        const searchResult = document.getElementById('snize_results');
        searchResult.append(popularCategoryMarkup);
      }

      count++;
    }, 200);

    if (searchResult && mostPopularDiv) {
      searchResult.parentElement.append(mostPopularDiv);
    }
  });
}
