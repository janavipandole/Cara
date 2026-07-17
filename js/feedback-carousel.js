// Testimonial Slider Loop Carousel
document.addEventListener('DOMContentLoaded', () => {
  const feedbackList = [
    {
      name: 'Jessica M.',
      text: 'The try-on camera tool is absolute magic! Fitting preview is spot on.',
      role: 'Verified Shopper',
    },
    {
      name: 'Marcus K.',
      text: 'Ultra-fast shipping and premium cardboard wrapping. Extremely happy with Cara.',
      role: 'Fashion Designer',
    },
    {
      name: 'Anita S.',
      text: 'Dark mode gives a fantastic modern layout feel. Checkout is super fast.',
      role: 'VIP Customer',
    },
  ];

  const targetDiv = document.getElementById('testimonial-slider-container');
  if (!targetDiv) return;

  let index = 0;

  const renderCard = () => {
    const current = feedbackList[index];
    targetDiv.innerHTML = `
            <div style="text-align: center; max-width: 600px; margin: 0 auto; transition: opacity 0.5s ease; opacity: 1; padding: 25px; border-radius: 12px; background: rgba(8,129,120,0.06);">
                <i class="ri-double-quotes-l" style="font-size:36px; color:#088178; display:block; margin-bottom:10px;"></i>
                <p style="font-style:italic; font-size:16px; line-height:1.6; color:#555;">"${current.text}"</p>
                <h4 style="margin:12px 0 2px 0; color:#088178;">${current.name}</h4>
                <span style="font-size:12px; color:#777;">${current.role}</span>
                <div style="display:flex; justify-content:center; gap:8px; margin-top:15px;">
                    <button id="prev-slide-btn" style="border:none; background:none; cursor:pointer; font-size:18px; color:#088178;"><i class="ri-arrow-left-s-line"></i></button>
                    <button id="next-slide-btn" style="border:none; background:none; cursor:pointer; font-size:18px; color:#088178;"><i class="ri-arrow-right-s-line"></i></button>
                </div>
            </div>
        `;

    document.getElementById('prev-slide-btn').addEventListener('click', () => {
      index = (index - 1 + feedbackList.length) % feedbackList.length;
      renderCard();
    });
    document.getElementById('next-slide-btn').addEventListener('click', () => {
      index = (index + 1) % feedbackList.length;
      renderCard();
    });
  };

  renderCard();
});
