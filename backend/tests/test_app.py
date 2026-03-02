"""Unit tests for the Hosei SNS application."""
import pytest
from app import app, db
from models import User, Post, Comment, Friend, Message
from werkzeug.security import generate_password_hash


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.drop_all()
        db.create_all()
        pw = generate_password_hash("test123", method="pbkdf2:sha256")
        s = User(username="student1", email="s@test.com", password=pw, role="student", department="æƒ…å ±ç§‘å­¦éƒ?)
        t = User(username="teacher1", email="t@test.com", password=pw, role="teacher", department="æ³•å­¦éƒ?)
        a = User(username="admin", email="a@test.com", password=pw, role="developer")
        db.session.add_all([s, t, a])
        db.session.commit()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def login(client, username, role):
    return client.post(f"/login/{role}", data={"username": username, "password": "test123"}, follow_redirects=True)


def get_user_id(username):
    return User.query.filter_by(username=username).first().id


def get_first(model):
    return model.query.first()


# --- Auth Tests ---
class TestAuth:
    def test_login_page(self, client):
        assert client.get("/login").status_code == 200

    def test_student_login(self, client):
        assert login(client, "student1", "student").status_code == 200

    def test_teacher_login(self, client):
        assert login(client, "teacher1", "teacher").status_code == 200

    def test_developer_login(self, client):
        assert login(client, "admin", "developer").status_code == 200

    def test_wrong_password(self, client):
        r = client.post("/login/student", data={"username": "student1", "password": "wrong"}, follow_redirects=True)
        assert r.status_code == 200

    def test_wrong_role(self, client):
        r = client.post("/login/teacher", data={"username": "student1", "password": "test123"}, follow_redirects=True)
        assert r.status_code == 200

    def test_signup(self, client):
        r = client.post("/signup/student", data={
            "username": "newuser", "email": "new@test.com", "password": "pass123", "department": "æ–‡å­¦éƒ?
        }, follow_redirects=True)
        assert r.status_code == 200
        assert User.query.filter_by(username="newuser").first() is not None

    def test_signup_duplicate(self, client):
        client.post("/signup/student", data={"username": "student1", "email": "d@t.com", "password": "p", "department": ""}, follow_redirects=True)

    def test_logout(self, client):
        login(client, "student1", "student")
        assert client.get("/logout", follow_redirects=True).status_code == 200


# --- Post Tests ---
class TestPosts:
    def test_create_post(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "Test", "content": "Hello"}, follow_redirects=True)
        assert Post.query.filter_by(title="Test").first() is not None

    def test_home_with_posts(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "P1", "content": "C1"})
        assert client.get("/home").status_code == 200

    def test_post_detail(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "Detail", "content": "Body"})
        p = get_first(Post)
        assert client.get(f"/post/{p.id}").status_code == 200

    def test_delete_post(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "Del", "content": "Body"})
        p = get_first(Post)
        client.post(f"/post/{p.id}/delete", follow_redirects=True)
        assert Post.query.count() == 0


# --- Comment Tests ---
class TestComments:
    def test_add_comment(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "P", "content": "C"})
        p = get_first(Post)
        client.post(f"/post/{p.id}/comment", data={"content": "Nice!"}, follow_redirects=True)
        assert Comment.query.count() == 1

    def test_delete_comment(self, client):
        login(client, "student1", "student")
        client.post("/create", data={"title": "P", "content": "C"})
        p = get_first(Post)
        client.post(f"/post/{p.id}/comment", data={"content": "Del me"})
        c = get_first(Comment)
        client.post(f"/comment/{c.id}/delete", follow_redirects=True)
        assert Comment.query.count() == 0


# --- Friend Tests ---
class TestFriends:
    def test_friend_page(self, client):
        login(client, "student1", "student")
        assert client.get("/friend").status_code == 200

    def test_add_remove_friend(self, client):
        login(client, "student1", "student")
        tid = get_user_id("teacher1")
        client.post(f"/friend/{tid}", follow_redirects=True)
        assert Friend.query.count() == 1
        client.post(f"/friend/{tid}/delete", follow_redirects=True)
        assert Friend.query.count() == 0


# --- Search Tests ---
class TestSearch:
    def test_search_page(self, client):
        login(client, "student1", "student")
        assert client.get("/search?q=student").status_code == 200

    def test_search_empty(self, client):
        login(client, "student1", "student")
        assert client.get("/search?q=nonexistent").status_code == 200


# --- DM Tests ---
class TestDM:
    def test_dm_list(self, client):
        login(client, "student1", "student")
        assert client.get("/dm").status_code == 200

    def test_dm_chat(self, client):
        login(client, "student1", "student")
        tid = get_user_id("teacher1")
        assert client.get(f"/dm/{tid}").status_code == 200


# --- API Tests ---
class TestAPI:
    def test_api_posts(self, client):
        login(client, "student1", "student")
        r = client.get("/api/posts")
        assert r.status_code == 200
        assert "posts" in r.get_json()

    def test_api_create_post(self, client):
        login(client, "student1", "student")
        r = client.post("/api/posts", json={"title": "API", "content": "test"})
        assert r.status_code == 201

    def test_api_delete_post(self, client):
        login(client, "student1", "student")
        client.post("/api/posts", json={"title": "Del", "content": "test"})
        p = get_first(Post)
        r = client.delete(f"/api/posts/{p.id}")
        assert r.status_code == 200

    def test_api_search_users(self, client):
        login(client, "student1", "student")
        r = client.get("/api/users/search?q=student")
        assert r.status_code == 200
        assert len(r.get_json()["users"]) > 0

    def test_api_unauthorized(self, client):
        r = client.get("/api/posts")
        assert r.status_code == 401


# --- Admin Tests ---
class TestAdmin:
    def test_admin_dashboard(self, client):
        login(client, "admin", "developer")
        assert client.get("/admin").status_code == 200

    def test_admin_users(self, client):
        login(client, "admin", "developer")
        assert client.get("/admin/users").status_code == 200

    def test_admin_posts(self, client):
        login(client, "admin", "developer")
        assert client.get("/admin/posts").status_code == 200

    def test_admin_forbidden_for_student(self, client):
        login(client, "student1", "student")
        r = client.get("/admin", follow_redirects=True)
        assert r.status_code == 200

    def test_admin_delete_user(self, client):
        login(client, "admin", "developer")
        uid = get_user_id("student1")
        client.post(f"/admin/user/{uid}/delete", follow_redirects=True)
        assert User.query.filter_by(username="student1").first() is None


# --- Pagination & Language ---
class TestMisc:
    def test_home_pagination(self, client):
        login(client, "student1", "student")
        for i in range(25):
            client.post("/create", data={"title": f"Post {i}", "content": f"Content {i}"})
        assert client.get("/home?page=1").status_code == 200
        assert client.get("/home?page=2").status_code == 200

    def test_switch_language(self, client):
        for lang in ["en", "zh", "ko", "ja"]:
            assert client.get(f"/lang/{lang}", follow_redirects=True).status_code == 200

    def test_404(self, client):
        assert client.get("/nonexistent").status_code == 404

    def test_api_upload_no_file(self, client):
        login(client, "student1", "student")
        r = client.post("/api/upload")
        assert r.status_code == 400
# updated: ¥Ğ¥Ã¥¯¥¨¥ó¥É¥Æ¥¹¥È’ˆ³ä
