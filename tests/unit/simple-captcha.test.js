import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('simple-captcha', () => {
  let input;
  let feedback;

  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <form id="login">
        <button type="submit">Login</button>
      </form>
    `;
  });

  it('injects the captcha and blocks a wrong answer on submit', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    await import('../../js/simple-captcha.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    input = document.getElementById('captcha-input');
    feedback = document.getElementById('captcha-feedback');
    expect(input).toBeTruthy();
    expect(document.getElementById('captcha-math-label')).toBeTruthy();

    input.value = '99999';
    const form = document.getElementById('login');
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(feedback.textContent).toContain('Incorrect captcha');
  });

  it('clears the captcha input via the reset button', async () => {
    await import('../../js/simple-captcha.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    input = document.getElementById('captcha-input');
    input.value = '42';
    const resetBtn = document.getElementById('captcha-reset-btn');
    expect(resetBtn).toBeTruthy();
    resetBtn.click();
    expect(input.value).toBe('');
  });
});
