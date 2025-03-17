from datetime import datetime
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Post(db.Model):
    __tablename__ = "posts"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String, nullable=False)
    content = db.Column(db.String, nullable=False)
    ip = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref="posts", lazy=True)

    def to_dict(self):
        content = self.content[:100] + "..." if len(self.content) > 100 else self.content
        return {
            "id": self.id,
            "title": self.title,
            "content": content,
            "full_content": self.content,
            "ip": self.ip,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "user_id": self.user_id,
        }


class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)
    name = db.Column(db.String, default="")
    created_at = db.Column(db.DateTime, default=datetime.now)
    department = db.Column(db.String)
    lang = db.Column(db.String, default="ja")
    role = db.Column(db.String, default="student")  # student, teacher, developer

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "name": self.name or "",
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "department": self.department,
            "role": self.role,
        }

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def get_id(self):
        return str(self.id)


class Reaction(db.Model):
    __tablename__ = "reactions"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = db.Column(db.String, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    reaction = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


class Friend(db.Model):
    __tablename__ = "friends"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    friend_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


class Class(db.Model):
    __tablename__ = "classes"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    department = db.Column(db.String, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    code = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    season = db.Column(db.String, nullable=False)
    time = db.Column(db.Integer, nullable=False)
    day = db.Column(db.String, nullable=False)
    place = db.Column(db.String, nullable=False)
    unit = db.Column(db.Integer, nullable=False)
    url = db.Column(db.String, nullable=False)
    teacher = db.Column(db.String, nullable=False)
    grade_min = db.Column(db.Integer, nullable=False)
    grade_max = db.Column(db.Integer, nullable=False)
    note = db.Column(db.String, nullable=False)
    error = db.Column(db.String, nullable=False)
    is_spring = db.Column(db.Boolean, nullable=False)
    is_autumn = db.Column(db.Boolean, nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "department": self.department, "year": self.year,
            "code": self.code, "name": self.name, "season": self.season,
            "time": self.time, "day": self.day, "place": self.place,
            "unit": self.unit, "url": self.url, "teacher": self.teacher,
            "grade_min": self.grade_min, "grade_max": self.grade_max,
            "note": self.note, "error": self.error,
            "is_spring": self.is_spring, "is_autumn": self.is_autumn,
        }

    def __init__(self, department, year, code, name, season, time, day, place,
                 unit, url, teacher, grade_min, grade_max, note, error):
        self.department = department
        self.year = year
        self.code = code
        self.name = name
        self.season = season
        self.time = time
        self.day = day
        self.place = place
        self.unit = unit
        self.url = url
        self.teacher = teacher
        self.grade_min = grade_min
        self.grade_max = grade_max
        self.note = note
        self.error = error
        if season in ["年間授業/Yearly", "春学期・秋学�?Spring・Fall"]:
            self.is_spring = True
            self.is_autumn = True
        elif season in ["春学期授�?Spring"]:
            self.is_spring = True
            self.is_autumn = False
        elif season in ["秋学期授�?Fall"]:
            self.is_spring = False
            self.is_autumn = True
        else:
            self.is_spring = False
            self.is_autumn = False


class Class_entry(db.Model):
    __tablename__ = "class_entries"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    class_id = db.Column(db.String, db.ForeignKey("classes.id"), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)


class Comment(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    post_id = db.Column(db.String, db.ForeignKey("posts.id"), nullable=False)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String, default="")
    created_at = db.Column(db.DateTime, default=datetime.now)
    user = db.relationship("User", backref="comments", lazy=True)
    post = db.relationship("Post", backref="comments", lazy=True)


class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    content = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String, default="")
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    receiver = db.relationship("User", foreign_keys=[receiver_id], backref="received_messages")
# updated: Comment��ǥ�
