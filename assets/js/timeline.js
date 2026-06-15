// Interactive milestone timeline enhancements
document.addEventListener('DOMContentLoaded', () => {
  const milestones = document.querySelectorAll(
    '.milestone-card, .timeline-item'
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1 }
  );

  milestones.forEach((m) => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(20px)';
    m.style.transition = 'all 0.6s ease-out';
    observer.observe(m);
  });
});
