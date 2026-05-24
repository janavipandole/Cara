// wishlist functionality using localStorage

function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function saveWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
}

function isInWishlist(name, img) {
  var list = getWishlist();
  return list.some(function (item) {
    return item.name === name && item.img === img;
  });
}

function toggleWishlist(name, price, img) {
  var list = getWishlist();
  var idx = list.findIndex(function (item) {
    return item.name === name && item.img === img;
  });

  if (idx > -1) {
    list.splice(idx, 1);
    showToast(name + ' removed from wishlist', 'info');
  } else {
    list.push({ name: name, price: price, img: img });
    showToast(name + ' added to wishlist!', 'success');
  }

  saveWishlist(list);
  updateWishlistIcons();
  updateWishlistCount();
}

function updateWishlistCount() {
  var count = getWishlist().length;
  var badges = document.querySelectorAll('.wishlist-count');
  badges.forEach(function (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function updateWishlistIcons() {
  var hearts = document.querySelectorAll('.wishlist-btn');
  hearts.forEach(function (btn) {
    var name = btn.getAttribute('data-name');
    var img = btn.getAttribute('data-img');
    var icon = btn.querySelector('i');
    if (isInWishlist(name, img)) {
      icon.className = 'ri-heart-fill';
      btn.classList.add('wishlisted');
    } else {
      icon.className = 'ri-heart-line';
      btn.classList.remove('wishlisted');
    }
  });
}

// render wishlist items on wishlist.html
function renderWishlist() {
  var container = document.getElementById('wishlist-items');
  if (!container) return;

  var list = getWishlist();
  var emptyMsg = document.getElementById('wishlist-empty');

  if (list.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  container.innerHTML = '';

  list.forEach(function (item, index) {
    var card = document.createElement('div');
    card.className = 'wishlist-card';
    card.innerHTML =
      '<img src="' + item.img + '" alt="' + item.name + '">' +
      '<div class="wishlist-info">' +
        '<h5>' + item.name + '</h5>' +
        '<h4>' + item.price + '</h4>' +
      '</div>' +
      '<div class="wishlist-actions">' +
        '<button class="wishlist-remove" onclick="removeFromWishlist(' + index + ')" title="Remove">' +
          '<i class="ri-delete-bin-line"></i>' +
        '</button>' +
      '</div>';
    container.appendChild(card);
  });
}

function removeFromWishlist(index) {
  var list = getWishlist();
  var removed = list[index];
  list.splice(index, 1);
  saveWishlist(list);
  updateWishlistCount();
  renderWishlist();
  if (removed) showToast(removed.name + ' removed from wishlist', 'info');
}

// inject heart buttons into product cards
function injectWishlistButtons() {
  var cards = document.querySelectorAll('.pro');
  cards.forEach(function (card) {
    if (card.querySelector('.wishlist-btn')) return;
    var name = card.querySelector('h5');
    var price = card.querySelector('h4');
    var img = card.querySelector('img');
    if (!name || !price || !img) return;

    var btn = document.createElement('button');
    btn.className = 'wishlist-btn';
    btn.setAttribute('data-name', name.textContent.trim());
    btn.setAttribute('data-img', img.getAttribute('src'));
    btn.title = 'Add to wishlist';
    btn.innerHTML = '<i class="ri-heart-line"></i>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      toggleWishlist(
        name.textContent.trim(),
        price.textContent.trim(),
        img.getAttribute('src')
      );
    });
    card.appendChild(btn);
  });
  updateWishlistIcons();
}

// init on page load
document.addEventListener('DOMContentLoaded', function () {
  injectWishlistButtons();
  updateWishlistCount();
  renderWishlist();
});
