/**
 * BFCM Timer Helper
 * Manages multiple countdown timers for Black Friday/Cyber Monday sales
 *
 * Features:
 * - Configurable timer start times from theme settings
 * - Auto-start functionality at specified time
 * - Multiple timer states (pre-sale, special sale, main sale)
 * - DOM updates for timer displays
 * - Sale state flags for conditional logic
 */

// Initialization function to be called from theme entry
export default function BFCMHelper() {
  try {
    var t = (typeof window !== 'undefined' ? window.theme : undefined);

    // Exit if no bfcm config or neither feature is enabled
    if (!t || !t.bfcm || (!t.bfcm.enableGwp && !t.bfcm.enableTimer)) return;

    var enableTimer = !!t.bfcm.enableTimer;
    var enableGwp = !!t.bfcm.enableGwp;

    // saleActive is based on enableGwp, but can turn false when timer ends
    var saleActive = enableGwp;
    t.bfcm.saleActive = saleActive;

    // Dispatch initial state
    window.dispatchEvent(new CustomEvent('saleActiveChanged', {
      detail: { saleActive: saleActive }
    }));

    function parseDateString(dateString) {
      if (!dateString || typeof dateString !== 'string') return null;
      if (dateString.includes('T')) return new Date(dateString);
      var parts = dateString.split(' ');
      if (parts.length < 2) return null;
      var d = parts[0].split('-');
      var y = parseInt(d[0], 10);
      var day = parseInt(d[1], 10);
      var m = parseInt(d[2], 10);
      var tparts = parts[1].split(':');
      var hh = parseInt(tparts[0] || '0', 10);
      var mm = parseInt(tparts[1] || '0', 10);
      var ss = parseInt((tparts[2] || '0'), 10);
      return new Date(y, (m || 1) - 1, day || 1, hh, mm, ss);
    }

    function formatTime(ms) {
      var totalSeconds = Math.max(0, Math.floor(ms / 1000));
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;
      if (hours > 0) {
        return (
          String(hours) + 'h ' +
          String(minutes).padStart(2, '0') + 'M'
        );
      }
      return (
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0') + ' Mins'
      );
    }

    function setSaleActive(newState) {
      if (saleActive === newState) return;

      saleActive = newState;
      t.bfcm.saleActive = saleActive;

      window.dispatchEvent(new CustomEvent('saleActiveChanged', {
        detail: { saleActive: saleActive }
      }));
    }

    // Use phase to determine display text
    function updateTimerElements(text) {
      var isPreSalePhase = phase === 'toStart';

      var els1 = document.querySelectorAll('.bfcm-countdown');
      els1.forEach(function (el) {
        if (isPreSalePhase) {
          el.textContent = 'Live in ' + text;
        } else {
          el.textContent = text;
        }
      });

      var els2 = document.querySelectorAll('.bfcm-sale-text');
      els2.forEach(function (el) {
        if (isPreSalePhase) {
          el.textContent = t.bfcm.preSaleText || '';
        } else {
          el.textContent = t.bfcm.duringSaleText || '';
        }
      });
    }

    function updateTimerElementsFinal() {
      var els1 = document.querySelectorAll('.bfcm-countdown');
      els1.forEach(function (el) {
        el.textContent = '00:00 Mins';
      });
      var els2 = document.querySelectorAll('.bfcm-sale-text');
      els2.forEach(function (el) {
        el.textContent = t.bfcm.duringSaleText || '';
      });
    }

    // Update only the sale text elements (no countdown text)
    function updateSaleTextOnly() {
      var isPreSalePhase = phase === 'toStart';

      var els = document.querySelectorAll('.bfcm-sale-text');
      els.forEach(function (el) {
        if (isPreSalePhase) {
          el.textContent = t.bfcm.preSaleText || '';
        } else {
          el.textContent = t.bfcm.duringSaleText || '';
        }
      });

      // Hide countdown elements when timer is disabled
      var countdownEls = document.querySelectorAll('.bfcm-countdown');
      countdownEls.forEach(function (el) {
        el.textContent = '';
      });
    }

    var saleStart = null;
    var saleEnd = null;
    var phase = null; // 'toStart' | 'toEnd'

    saleStart = parseDateString(t.bfcm.saleStartDate);
    saleEnd = parseDateString(t.bfcm.saleEndDate);

    // If timer is disabled, just update text once and exit
    if (!enableTimer) {
      // Compute phase for text display purposes only
      var now = new Date();
      if (saleStart && now < saleStart) {
        phase = 'toStart';
      } else {
        phase = 'toEnd';
      }

      setTimeout(function () {
        updateSaleTextOnly();
      }, 100);

      return;
    }

    // --- Timer is enabled, full timer logic below ---

    // If neither date is provided, nothing to count down
    if (!saleStart && !saleEnd) {
      phase = 'toEnd';
      setTimeout(function () {
        updateSaleTextOnly();
      }, 100);
      return;
    }

    var now = new Date();

    // Decide initial phase
    if (saleStart && now < saleStart) {
      phase = 'toStart';
    } else if (saleEnd && now < saleEnd) {
      phase = 'toEnd';
    } else {
      // Both dates are in the past - sale has ended
      phase = 'toEnd';
      setSaleActive(false); // Timer ended, sale is over
      setTimeout(function () {
        updateTimerElementsFinal();
      }, 1500);
      return;
    }

    // Clear any existing interval
    if (window.bfcmTimerInterval) {
      clearInterval(window.bfcmTimerInterval);
      window.bfcmTimerInterval = null;
    }

    function updateTimer() {
      var now = new Date();
      var targetDate;
      var diff;

      if (phase === 'toStart') {
        if (saleStart && now < saleStart) {
          targetDate = saleStart;
          diff = Math.max(0, targetDate - now);
          updateTimerElements(formatTime(diff));
          return;
        }
        // Reached/passed the start; switch to counting down to end
        if (saleEnd && now < saleEnd) {
          phase = 'toEnd';
          // Continue to toEnd logic below
        } else {
          // No end date or already past end - timer done
          updateTimerElementsFinal();
          setSaleActive(false); // Timer ended
          if (window.bfcmTimerInterval) {
            clearInterval(window.bfcmTimerInterval);
            window.bfcmTimerInterval = null;
          }
          return;
        }
      }

      if (phase === 'toEnd') {
        if (saleEnd && now < saleEnd) {
          targetDate = saleEnd;
          diff = Math.max(0, targetDate - now);
          updateTimerElements(formatTime(diff));
        } else {
          // End time reached - stop timer
          updateTimerElementsFinal();
          setSaleActive(false); // Timer ended
          if (window.bfcmTimerInterval) {
            clearInterval(window.bfcmTimerInterval);
            window.bfcmTimerInterval = null;
          }
        }
      }
    }

    // Initial update
    updateTimer();

    // Update every second
    window.bfcmTimerInterval = setInterval(updateTimer, 1000);

  } catch (e) {
    if (window && window.console && console.error) {
      console.error('BFCMHelper error:', e);
    }
  }
}