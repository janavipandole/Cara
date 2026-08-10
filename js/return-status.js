/**
 * Estimated Return Date policy engine (ReturnStatus)
 *
 * Algorithmically computes the immutable return deadline for a delivered
 * order as `delivered_at + RETURN_WINDOW_DAYS` and renders a clear status
 * into the Account Dashboard / Order History:
 *   - eligible: "Eligible for return until {date}" (return button enabled)
 *   - expired:  "Return window closed on {date}" (return button disabled)
 *   - otherwise: no return window yet (button disabled)
 *
 * Mirrors the backend policy (backend/app/api/orders.py RETURN_WINDOW_DAYS).
 */
const RETURN_WINDOW_DAYS = 30;

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ordinalSuffix(day) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = day % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatDeadline(date) {
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  return `${month} ${date.getDate()}${ordinalSuffix(date.getDate())}`;
}

function computeReturnDeadline(deliveredAt, windowDays = RETURN_WINDOW_DAYS) {
  const delivered = toDate(deliveredAt);
  if (!delivered) return null;
  const deadline = new Date(delivered.getTime());
  deadline.setDate(deadline.getDate() + windowDays);
  return deadline;
}

function getReturnStatus(order, windowDays = RETURN_WINDOW_DAYS) {
  const status = String((order && order.status) || '').toUpperCase();

  if (status === 'CANCELLED') {
    return {
      state: 'unavailable',
      deadline: null,
      deadlineLabel: '',
      message: 'This order was cancelled.',
      canRequestReturn: false,
    };
  }

  const deliveredAt = order && (order.delivered_at || order.deliveredAt);
  const deadline = computeReturnDeadline(deliveredAt, windowDays);

  if (!deadline) {
    return {
      state: 'not-delivered',
      deadline: null,
      deadlineLabel: '',
      message: 'Returns available once the order is delivered.',
      canRequestReturn: false,
    };
  }

  const now = new Date();
  const eligible = deadline.getTime() >= now.getTime();
  const deadlineLabel = formatDeadline(deadline);

  return {
    state: eligible ? 'eligible' : 'expired',
    deadline,
    deadlineLabel,
    message: eligible
      ? `Eligible for return until ${deadlineLabel}.`
      : `Return window closed on ${deadlineLabel}.`,
    canRequestReturn: eligible,
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (ch) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[ch],
  );
}

function renderReturnStatus(order, windowDays = RETURN_WINDOW_DAYS) {
  const info = getReturnStatus(order, windowDays);
  const stateClass = `return-status return-status--${info.state}`;

  let button = '';
  if (info.state === 'eligible' || info.state === 'expired') {
    const disabled = info.state === 'expired';
    const disabledAttr = disabled ? ' disabled' : '';
    button = `<button class="return-request-btn" type="button"${disabledAttr}>${
      disabled ? 'Returns Closed' : 'Request Return'
    }</button>`;
  }

  return `
    <div class="${stateClass}" role="status">
      <span class="return-status__text">${escapeHtml(info.message)}</span>
      ${button}
    </div>
  `;
}

function renderReturnDeadlineInline(order, windowDays = RETURN_WINDOW_DAYS) {
  const info = getReturnStatus(order, windowDays);
  if (info.state !== 'eligible' && info.state !== 'expired') {
    return '';
  }
  return `<div class="return-deadline-inline return-deadline-inline--${info.state}">${escapeHtml(
    info.message,
  )}</div>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RETURN_WINDOW_DAYS,
    computeReturnDeadline,
    getReturnStatus,
    renderReturnStatus,
    renderReturnDeadlineInline,
  };
} else {
  window.ReturnStatus = {
    RETURN_WINDOW_DAYS,
    computeReturnDeadline,
    getReturnStatus,
    renderReturnStatus,
    renderReturnDeadlineInline,
  };
}
