def test_admin_create_product(client, admin_auth_headers):
    response = client.post(
        "/api/admin/products/",
        json={
            "id": 1,
            "brand": "Test Brand",
            "name": "Admin Created Product",
            "price": 49.99,
            "img": "test.jpg",
            "rating": 4,
            "category": "street",
            "stock": 25,
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Admin Created Product"
    assert data["price"] == 49.99


def test_admin_create_duplicate_product(client, admin_auth_headers):
    client.post(
        "/api/admin/products/",
        json={
            "id": 2,
            "brand": "Brand",
            "name": "Dup Product",
            "price": 20.0,
            "img": "test.jpg",
            "rating": 3,
            "category": "minimal",
            "stock": 10,
        },
        headers=admin_auth_headers,
    )
    response = client.post(
        "/api/admin/products/",
        json={
            "id": 3,
            "brand": "Brand",
            "name": "Dup Product",
            "price": 25.0,
            "img": "test.jpg",
            "rating": 3,
            "category": "minimal",
            "stock": 10,
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 409


def test_non_admin_cannot_create(client, auth_headers):
    response = client.post(
        "/api/admin/products/",
        json={
            "id": 99,
            "brand": "B",
            "name": "Unauthorized Product",
            "price": 1.0,
            "img": "x.jpg",
            "rating": 1,
            "category": "street",
            "stock": 1,
        },
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_admin_delete_nonexistent_product(client, admin_auth_headers):
    response = client.delete("/api/admin/products/9999", headers=admin_auth_headers)
    assert response.status_code == 404


def test_admin_update_stock_invalid(client, admin_auth_headers):
    response = client.patch(
        "/api/admin/products/9999/stock?stock=50",
        headers=admin_auth_headers,
    )
    assert response.status_code == 404
