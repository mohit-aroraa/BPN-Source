export const initOrderBy = () => {
  const container = document.querySelector('.order-by');
  const textEl = container?.querySelector('p');
  if (!container || !textEl) return;

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  let countdownTimer;

  const getTimeUntilNoon = () => {
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);

    const diff = noon - new Date();
    if (diff <= 0) return null;

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  if (day === 6) {
    container.style.display = 'none';
    return;
  }

  if (day === 0) {
    textEl.innerHTML = 'Order <strong>TODAY</strong>. Ships <strong>Within 2 days</strong>';
    return;
  }

  if (hour < 12) {
    const timeLeft = getTimeUntilNoon();

    if (!timeLeft) {
      textEl.innerHTML = 'Order <strong>TODAY</strong>. Ships <strong>TOMORROW</strong>';
      return;
    }

    textEl.innerHTML = `
      Order within <b>${timeLeft}</b>. Ships <strong>TODAY</strong>
    `;

    countdownTimer = setInterval(() => {
      const updatedTime = getTimeUntilNoon();
      if (!updatedTime) {
        clearInterval(countdownTimer);
        textEl.innerHTML = 'Order <strong>TODAY</strong>. Ships <strong>TOMORROW</strong>';
        return;
      }
      textEl.querySelector('b').textContent = updatedTime;
    }, 1000);

  } else {
    textEl.innerHTML = 'Order <strong>TODAY</strong>. Ships <strong>TOMORROW</strong>';
  }
};
