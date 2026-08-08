"""Loyalty redemption: server-side validation, discount, balance, earning."""
from passlib.context import CryptContext

from app.models import LoyaltyAccount, Product, User
from tests.conftest import TestingSessionLocal

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _login_headers(client, email, password, username):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    user_id = user.id
    db.close()

    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}, user_id


def _seed_product(name="Loyalty Tee", price=1000.0, stock=50):
    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.name == name).first()
    if product is None:
        product = Product(
            brand="Cara",
            name=name,
            price=price,
            img="tee.jpg",
            rating=4,
            category="street",
            stock=stock,
        )
        db.add(product)
        db.commit()
    db.close()
    return name


def _set_balance(user_id, balance):
    db = TestingSessionLocal()
    account = (
        db.query(LoyaltyAccount)
        .filter(LoyaltyAccount.user_id == user_id)
        .first()
    )
    if account is None:
        account = LoyaltyAccount(user_id=user_id, balance=balance)
        db.add(account)
    else:
        account.balance = balance
    db.commit()
    db.close()


def _get_balance(user_id):
    db = TestingSessionLocal()
    account = (
        db.query(LoyaltyAccount)
        .filter(LoyaltyAccount.user_id == user_id)
        .first()
    )
    value = account.balance if account else 0
    db.close()
    return value


def _order_payload(product_name="Loyalty Tee", email="loy1@example.com", key="loy-key-1", loyalty_points=0):
    return {
        "fullName": "Loyal Buyer",
        "email": email,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "10001",
        "items": [{"product_name": product_name, "quantity": 1}],
        "coupon": None,
        "loyalty_points": loyalty_points,
        "idempotency_key": key,
    }


def test_order_with_loyalty_points_deducts_balance_and_stores_discount(client):
    _seed_product()
    headers, user_id = _login_headers(client, "loy1@example.com", "Secure123@", "loy1")
    _set_balance(user_id, 500)

    response = client.post(
        "/api/orders/",
        json=_order_payload(loyalty_points=100, key="loy-key-1"),
        headers=headers,
    )

    assert response.status_code == 201, response.text
    body = response.json()
    # subtotal 1000 + tax 180 + shipping 150 - loyalty discount 10 = 1320
    assert body["loyalty_balance"] == 500  # -100 redeemed + 100 earned (floor(1000*10/100))

    order_id = body["order_id"]
    db = TestingSessionLocal()
    from app.models import Order

    order = db.query(Order).filter(Order.id == order_id).one()
    assert order.total_amount == 1320.0
    assert order.loyalty_points_redeemed == 100
    assert order.loyalty_discount == 10.0
    db.close()

    assert _get_balance(user_id) == 500


def test_insufficient_loyalty_points_rejected(client):
    _seed_product(name="Loyalty Insufficient Tee")
    headers, user_id = _login_headers(client, "loy2@example.com", "Secure123@", "loy2")
    _set_balance(user_id, 50)

    response = client.post(
        "/api/orders/",
        json=_order_payload(
            product_name="Loyalty Insufficient Tee",
            email="loy2@example.com",
            key="loy-key-2",
            loyalty_points=100,
        ),
        headers=headers,
    )

    assert response.status_code == 400
    assert "Insufficient loyalty points" in response.json()["detail"]
    assert _get_balance(user_id) == 50


def test_loyalty_balance_created_and_credited_for_new_user(client):
    _seed_product(name="Loyalty Earn Tee")
    headers, user_id = _login_headers(client, "loy3@example.com", "Secure123@", "loy3")

    response = client.post(
        "/api/orders/",
        json=_order_payload(
            product_name="Loyalty Earn Tee",
            email="loy3@example.com",
            key="loy-key-3",
            loyalty_points=0,
        ),
        headers=headers,
    )
    assert response.status_code == 201, response.text

    # subtotal 1000 -> floor(1000 * 10 / 100) = 100 points earned
    assert _get_balance(user_id) == 100

    balance_response = client.get("/api/loyalty/balance", headers=headers)
    assert balance_response.status_code == 200
    assert balance_response.json()["balance"] == 100


def test_loyalty_discount_capped_at_order_total(client):
    _seed_product(name="Loyalty Cap Tee", price=100.0)
    headers, user_id = _login_headers(client, "loy4@example.com", "Secure123@", "loy4")
    _set_balance(user_id, 5000)

    response = client.post(
        "/api/orders/",
        json=_order_payload(
            product_name="Loyalty Cap Tee",
            email="loy4@example.com",
            key="loy-key-4",
            loyalty_points=5000,
        ),
        headers=headers,
    )
    assert response.status_code == 201, response.text

    db = TestingSessionLocal()
    from app.models import Order

    order = db.query(Order).order_by(Order.id.desc()).first()
    # payable = 100 + 18 + 150 = 268; loyalty discount clamps to 268 -> total 0
    assert order.total_amount == 0.0
    assert order.loyalty_discount == 268.0
    db.close()
    # 5000 redeemed - 5000 + 10 earned (floor(100*10/100)) = 10
    assert _get_balance(user_id) == 10


def test_loyalty_balance_endpoint_requires_auth(client):
    response = client.get("/api/loyalty/balance")
    assert response.status_code == 401
