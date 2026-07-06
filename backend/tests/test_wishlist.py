def test_get_wishlist_empty(client, auth_headers):
    response = client.get("/api/wishlist/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_add_to_wishlist(client, auth_headers, db_session):
    from backend.app.models import Product
    product = Product(
        brand="Test", name="Test Product", price=100.0,
        img="test.jpg", rating=4, category="test", stock=10
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)

    response = client.post(f"/api/wishlist/{product.id}", headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["message"] == "Product added to wishlist"


def test_add_duplicate_wishlist(client, auth_headers, db_session):
    from backend.app.models import Product
    product = Product(
        brand="Test", name="Test Product", price=100.0,
        img="test.jpg", rating=4, category="test", stock=10
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)

    client.post(f"/api/wishlist/{product.id}", headers=auth_headers)
    response = client.post(f"/api/wishlist/{product.id}", headers=auth_headers)
    assert response.status_code == 409


def test_remove_from_wishlist(client, auth_headers, db_session):
    from backend.app.models import Product
    product = Product(
        brand="Test", name="Test Product", price=100.0,
        img="test.jpg", rating=4, category="test", stock=10
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)

    client.post(f"/api/wishlist/{product.id}", headers=auth_headers)
    response = client.delete(f"/api/wishlist/{product.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Product removed from wishlist"


def test_remove_nonexistent_wishlist(client, auth_headers):
    response = client.delete("/api/wishlist/999", headers=auth_headers)
    assert response.status_code == 404
