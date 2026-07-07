var API_BASE = window.CARA_API_BASE_URL || "http://127.0.0.1:8000";

function getAuthToken() {
  return localStorage.getItem("access_token") || "";
}

function adminRequest(method, path, body) {
  var opts = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getAuthToken(),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + path, opts).then(function (r) {
    if (!r.ok)
      return r.json().then(function (d) {
        throw new Error(d.detail || "Request failed");
      });
    return r.json();
  });
}

window.AdminProducts = {
  create: function (data) {
    return adminRequest("POST", "/api/admin/products/", data);
  },
  update: function (id, data) {
    return adminRequest("PUT", "/api/admin/products/" + id, data);
  },
  delete: function (id) {
    return adminRequest("DELETE", "/api/admin/products/" + id);
  },
  updateStock: function (id, stock) {
    return fetch(
      API_BASE + "/api/admin/products/" + id + "/stock?stock=" + stock,
      {
        method: "PATCH",
        headers: { Authorization: "Bearer " + getAuthToken() },
      }
    ).then(function (r) {
      if (!r.ok)
        return r.json().then(function (d) {
          throw new Error(d.detail || "Request failed");
        });
      return r.json();
    });
  },
};
