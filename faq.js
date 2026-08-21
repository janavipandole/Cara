document.addEventListener('DOMContentLoaded', () => {
  const faqBtns = document.querySelectorAll('.faq-accordion-btn');
  faqBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('i');
      if (answer.style.display === "none" || !answer.style.display) {
        answer.style.display = "block";
        icon.className = "ri-subtract-line";
      } else {
        answer.style.display = "none";
        icon.className = "ri-add-line";
      }
    });
  });
});
