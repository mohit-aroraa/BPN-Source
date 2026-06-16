export default function setUpTooltip() {
  let tooltip = '',
    toolTipDiv = document.querySelector('.div-tooltip'),
    toolTipElements = document.querySelectorAll('.hover-reveal'),
    timer;
  const isMobile = window.innerWidth < 1024.98 ? true : false;

  let fadeOut = function (element) {
    let op = 1;
    if (!timer) {
      timer = setInterval(function () {
        if (op <= 0.1) {
          clearInterval(timer);
          timer = null;
          element.style.opacity = 0;
          element.style.display = 'none';
        }
        element.style.opacity = op;
        op -= op * 0.1;
      }, 10);
    }
  };

  let fadeIn = function (element) {
    let op = 0.1;
    element.style.display = 'grid';
    let timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer);
        element.style.opacity = 1;
      }
      element.style.opacity = op;
      op += op * 0.1;
    }, 10);
  };

  let displayTooltip = function (e, element) {
    tooltip = element.dataset.markup;
    toolTipDiv.innerHTML = tooltip;
    var elementRect = element.getBoundingClientRect();
    const top = elementRect.top + elementRect.height + 5;
    toolTipDiv.style.top = top + 'px';
    toolTipDiv.style.left = elementRect.left + 'px';
    fadeIn(toolTipDiv);
  };

  if (isMobile && toolTipDiv) {
    toolTipDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('div-tooltip')) {
        fadeOut(toolTipDiv);
        document.body.style.overflow = 'scroll';
      }
    });
  }

  if (toolTipElements) {
    toolTipElements.forEach(function (elem) {
      let timeout;
      if (!isMobile) {
        elem.addEventListener('mouseenter', function (e) {
          timeout = setTimeout(() => {
            displayTooltip(e, this);
          }, 50);
        });
        elem.addEventListener('mouseleave', function () {
          clearTimeout(timeout);
          fadeOut(toolTipDiv);
        });
      } else {
        elem.addEventListener('click', function () {
          tooltip = this.dataset.markup;
          toolTipDiv.classList.add('tooltip__mobile');
          toolTipDiv.innerHTML = tooltip;
          document.body.style.overflow = 'hidden';
          fadeIn(toolTipDiv);

          //Close tooltip
          const close = toolTipDiv.querySelector(
            '.purchaseTypeTextTooltipBody__close',
          );
          if (close) {
            close.addEventListener('click', function () {
              fadeOut(toolTipDiv);
              document.body.style.overflow = 'scroll';
            });
          }
        });
      }
    });
  }
}
