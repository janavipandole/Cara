const API_BASE = window.CARA_API_BASE_URL || '';



function adminRequest(method, path, body) {
  const opts = {
    method: method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + path, opts).then(function (r) {
    if (!r.ok)
      return r.json().then(function (d) {
        throw new Error(d.detail || 'Request failed');
      });
    return r.json();
  }).catch(function(err) {
    console.error("[AdminProducts] Request failed:", err); // Production: consider removing or using proper error handling
    throw err;
  });
}

window.AdminProducts = {
  create: function (data) {
    return adminRequest('POST', '/api/admin/products/', data);
  },
  update: function (id, data) {
    return adminRequest('PUT', '/api/admin/products/' + id, data);
  },
  delete: function (id) {
    return adminRequest('DELETE', '/api/admin/products/' + id);
  },
  updateStock: function (id, stock) {
    if (typeof stock !== 'number' || !isFinite(stock) || stock < 0) {
      return Promise.reject(new Error('Stock value must be a non-negative number.'));
    }
    return fetch(
    API_BASE + '/api/admin/products/' + id + '/stock?stock=' + stock,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  ).then(function (r) {
    if (!r.ok)
      return r.json().then(function (d) {
        throw new Error(d.detail || 'Request failed');
      });
    return r.json();
  }).catch(function(err) {
    console.error("[AdminProducts] Request failed:", err); // Production: consider removing or using proper error handling
    throw err;
  });
}
}