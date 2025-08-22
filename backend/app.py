import os
import uuid
from flask import (Flask, redirect, render_template, request, session,
                   url_for, flash, jsonify, send_from_directory)
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from flask_socketio import SocketIO, emit, join_room
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
from functools import wraps

from models import User, Post, Reaction, Friend, Class, Class_entry, Comment, Message, db
from i18n import t, TRANSLATIONS
from ai import summarize_post, translate_text, campus_chat, moderate_content, extract_search_keywords

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SECRET_KEY"] = "codemates1234567890"
app.config["UPLOAD_FOLDER"] = os.path.join(app.static_folder, "uploads")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB max
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

login_manager = LoginManager(app)
login_manager.login_view = "login"

POSTS_PER_PAGE = 20


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(file):
    """Save uploaded file, return URL path."""
    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        return f"/static/uploads/{filename}"
    return ""


def get_lang():
    return session.get("lang", "ja")


def admin_required(f):
    """Decorator: require developer role."""
    @wraps(f)
    @login_required
    def decorated(*args, **kwargs):
        if current_user.role != "developer":
            flash(t("login_required", get_lang()), "error")
            return redirect(url_for("home"))
        return f(*args, **kwargs)
    return decorated


@app.context_processor
def inject_i18n():
    lang = get_lang()
    unread = 0
    if current_user.is_authenticated:
        unread = Message.query.filter_by(receiver_id=current_user.id, is_read=False).count()
    return dict(t=lambda key: t(key, lang), lang=lang, unread_count=unread)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith("/api/"):
        return jsonify({"error": "unauthorized"}), 401
    flash(t("login_required", get_lang()), "warning")
    return redirect(url_for("login"))


@app.errorhandler(404)
def not_found(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "not found"}), 404
    return render_template("error.html", error=t("page_not_found", get_lang())), 404


@app.errorhandler(500)
def server_error(e):
    if request.path.startswith("/api/"):
        return jsonify({"error": "server error"}), 500
    return render_template("error.html", error=t("error_occurred", get_lang())), 500


# ============================================================
# REST API
# ============================================================
@app.route("/api/posts")
@login_required
def api_posts():
    page = request.args.get("page", 1, type=int)
    q = Post.query.order_by(Post.created_at.desc())
    total = q.count()
    posts = q.offset((page - 1) * POSTS_PER_PAGE).limit(POSTS_PER_PAGE).all()
    return jsonify({
        "posts": [{**p.to_dict(), "username": p.user.username, "comment_count": len(p.comments)} for p in posts],
        "total": total, "page": page, "pages": (total + POSTS_PER_PAGE - 1) // POSTS_PER_PAGE,
    })


@app.route("/api/posts/<uuid:post_id>")
@login_required
def api_post(post_id):
    p = Post.query.get_or_404(str(post_id))
    comments = [{
        "id": c.id, "content": c.content, "image_url": c.image_url,
        "username": c.user.username, "user_id": c.user_id,
        "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    } for c in Comment.query.filter_by(post_id=str(post_id)).order_by(Comment.created_at.asc()).all()]
    return jsonify({**p.to_dict(), "username": p.user.username, "comments": comments})


@app.route("/api/posts", methods=["POST"])
@login_required
def api_create_post():
    data = request.get_json()
    if not data or not data.get("title") or not data.get("content"):
        return jsonify({"error": "title and content required"}), 400
    p = Post(title=data["title"], content=data["content"], ip=request.remote_addr, user_id=current_user.id)
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201


@app.route("/api/posts/<uuid:post_id>", methods=["DELETE"])
@login_required
def api_delete_post(post_id):
    p = Post.query.get_or_404(str(post_id))
    if p.user_id != current_user.id and current_user.role != "developer":
        return jsonify({"error": "forbidden"}), 403
    Comment.query.filter_by(post_id=str(post_id)).delete()
    db.session.delete(p)
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/users/search")
@login_required
def api_search_users():
    q = request.args.get("q", "").strip()
    if len(q) < 1:
        return jsonify({"users": []})
    users = User.query.filter(User.username.like(f"%{q}%")).limit(20).all()
    return jsonify({"users": [u.to_dict() for u in users]})


@app.route("/api/messages/<uuid:user_id>")
@login_required
def api_messages(user_id):
    uid = str(user_id)
    msgs = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == uid)) |
        ((Message.sender_id == uid) & (Message.receiver_id == current_user.id))
    ).order_by(Message.created_at.asc()).all()
    # Mark as read
    Message.query.filter_by(sender_id=uid, receiver_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"messages": [{
        "id": m.id, "sender_id": m.sender_id, "receiver_id": m.receiver_id,
        "content": m.content, "image_url": m.image_url,
        "created_at": m.created_at.strftime("%Y-%m-%d %H:%M:%S"),
    } for m in msgs]})


@app.route("/api/upload", methods=["POST"])
@login_required
def api_upload():
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400
    f = request.files["file"]
    url = save_upload(f)
    if not url:
        return jsonify({"error": "invalid file type"}), 400
    return jsonify({"url": url})


# ============================================================
# WebSocket for real-time DM
# ============================================================
@socketio.on("join")
def on_join(data):
    if current_user.is_authenticated:
        join_room(current_user.id)


@socketio.on("send_message")
def on_send_message(data):
    if not current_user.is_authenticated:
        return
    receiver_id = data.get("receiver_id", "")
    content = data.get("content", "").strip()
    image_url = data.get("image_url", "")
    if not content and not image_url:
        return
    msg = Message(sender_id=current_user.id, receiver_id=receiver_id, content=content, image_url=image_url)
    db.session.add(msg)
    db.session.commit()
    payload = {
        "id": msg.id, "sender_id": msg.sender_id, "receiver_id": msg.receiver_id,
        "content": msg.content, "image_url": msg.image_url,
        "created_at": msg.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "sender_name": current_user.username,
    }
    emit("new_message", payload, room=receiver_id)
    emit("new_message", payload, room=current_user.id)


# ============================================================
# Language switch
# ============================================================
@app.route("/lang/<lang_code>")
def set_lang(lang_code):
    if lang_code in ("ja", "en", "zh", "ko"):
        session["lang"] = lang_code
        if current_user.is_authenticated:
            current_user.lang = lang_code
            db.session.commit()
    return redirect(request.referrer or url_for("home"))


# ============================================================
# Page routes
# ============================================================
@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    return redirect(url_for("login"))


@app.route("/home")
@login_required
def home():
    page = request.args.get("page", 1, type=int)
    pagination = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=POSTS_PER_PAGE, error_out=False)
    return render_template("home.html", posts=pagination.items, pagination=pagination)


@app.route("/create", methods=["POST", "GET"])
@login_required
def create():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        content = request.form.get("content", "").strip()
        if not title or not content:
            return redirect(url_for("create"))
        db.session.add(Post(title=title, content=content, ip=request.remote_addr, user_id=current_user.id))
        db.session.commit()
        return redirect(url_for("home"))
    return render_template("create.html")


@app.route("/post/<uuid:post_id>")
@login_required
def post(post_id):
    p = Post.query.get_or_404(str(post_id))
    user = User.query.get(p.user_id)
    comments = Comment.query.filter_by(post_id=str(post_id)).order_by(Comment.created_at.asc()).all()
    return render_template("post.html", post=p.to_dict(), user=user.to_dict(), comments=comments)


@app.route("/post/<uuid:post_id>/comment", methods=["POST"])
@login_required
def add_comment(post_id):
    Post.query.get_or_404(str(post_id))
    content = request.form.get("content", "").strip()
    image_url = ""
    if "image" in request.files and request.files["image"].filename:
        image_url = save_upload(request.files["image"])
    elif request.form.get("image_url", "").strip():
        image_url = request.form.get("image_url", "").strip()
    if content:
        db.session.add(Comment(post_id=str(post_id), user_id=current_user.id, content=content, image_url=image_url))
        db.session.commit()
    return redirect(url_for("post", post_id=post_id))


@app.route("/comment/<uuid:comment_id>/delete", methods=["POST"])
@login_required
def delete_comment(comment_id):
    c = Comment.query.get_or_404(str(comment_id))
    if c.user_id != current_user.id and current_user.role != "developer":
        return redirect(url_for("home"))
    pid = c.post_id
    db.session.delete(c)
    db.session.commit()
    return redirect(url_for("post", post_id=pid))


@app.route("/post/<uuid:post_id>/delete", methods=["POST"])
@login_required
def delete(post_id):
    p = Post.query.get_or_404(str(post_id))
    if p.user_id != current_user.id and current_user.role != "developer":
        return redirect(url_for("home"))
    Comment.query.filter_by(post_id=str(post_id)).delete()
    db.session.delete(p)
    db.session.commit()
    return redirect(url_for("home"))


# ============================================================
# Auth
# ============================================================
@app.route("/login")
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    return render_template("login.html")


@app.route("/login/<role>", methods=["GET", "POST"])
def login_role(role):
    if role not in ("student", "teacher", "developer"):
        return redirect(url_for("login"))
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = User.query.filter_by(username=username, role=role).first()
        if user and user.check_password(password):
            login_user(user)
            session["user_id"] = user.id
            if user.lang:
                session["lang"] = user.lang
            return redirect(url_for("home"))
        flash(t("login_failed", get_lang()), "error")
        return redirect(url_for("login_role", role=role))
    return render_template("login_role.html", role=role)


@app.route("/logout")
def logout():
    logout_user()
    session.clear()
    return redirect(url_for("login"))


@app.route("/signup/<role>", methods=["GET", "POST"])
def signup(role):
    if role not in ("student", "teacher"):
        return redirect(url_for("login"))
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        department = request.form.get("department", "").strip()
        raw_password = request.form.get("password", "")
        if User.query.filter_by(username=username).first():
            flash(t("username_taken", get_lang()), "error")
            return redirect(url_for("signup", role=role))
        password = generate_password_hash(raw_password, method="pbkdf2:sha256")
        db.session.add(User(username=username, email=email, password=password, department=department, role=role))
        db.session.commit()
        return redirect(url_for("login_role", role=role))
    return render_template("signup.html", role=role)


# ============================================================
# Friends & User search
# ============================================================
@app.route("/friend")
@login_required
def friend():
    friends = Friend.query.filter_by(user_id=current_user.id).all()
    friends_list = []
    for f in friends:
        fu = User.query.get(f.friend_id)
        if fu:
            d = fu.to_dict()
            d["friend_id"] = f.friend_id
            friends_list.append(d)
    return render_template("friend.html", friends=friends_list)


@app.route("/friend/<uuid:friend_id>", methods=["POST"])
@login_required
def friend_add(friend_id):
    fid = str(friend_id)
    if fid == current_user.id:
        return redirect(url_for("home"))
    if not Friend.query.filter_by(user_id=current_user.id, friend_id=fid).first():
        db.session.add(Friend(user_id=current_user.id, friend_id=fid))
        db.session.commit()
    return redirect(url_for("user", user_id=fid))


@app.route("/friend/<uuid:friend_id>/delete", methods=["POST"])
@login_required
def friend_delete(friend_id):
    fid = str(friend_id)
    f = Friend.query.filter_by(user_id=current_user.id, friend_id=fid).first()
    if f:
        db.session.delete(f)
        db.session.commit()
    return redirect(url_for("user", user_id=fid))


@app.route("/search")
@login_required
def search_users():
    q = request.args.get("q", "").strip()
    users = []
    if q:
        users = User.query.filter(User.username.like(f"%{q}%")).limit(30).all()
    return render_template("search.html", users=users, query=q)


# ============================================================
# DM (Direct Messages)
# ============================================================
@app.route("/dm")
@login_required
def dm_list():
    """Show list of conversations."""
    # Get all users we have messages with
    sent = db.session.query(Message.receiver_id).filter_by(sender_id=current_user.id).distinct()
    received = db.session.query(Message.sender_id).filter_by(receiver_id=current_user.id).distinct()
    partner_ids = set([r[0] for r in sent] + [r[0] for r in received])
    conversations = []
    for pid in partner_ids:
        partner = User.query.get(pid)
        if not partner:
            continue
        last_msg = Message.query.filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == pid)) |
            ((Message.sender_id == pid) & (Message.receiver_id == current_user.id))
        ).order_by(Message.created_at.desc()).first()
        unread = Message.query.filter_by(sender_id=pid, receiver_id=current_user.id, is_read=False).count()
        conversations.append({"user": partner.to_dict(), "last_msg": last_msg, "unread": unread})
    conversations.sort(key=lambda x: x["last_msg"].created_at if x["last_msg"] else "", reverse=True)
    return render_template("dm_list.html", conversations=conversations)


@app.route("/dm/<uuid:user_id>")
@login_required
def dm_chat(user_id):
    """Chat page with a specific user."""
    partner = User.query.get_or_404(str(user_id))
    Message.query.filter_by(sender_id=str(user_id), receiver_id=current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == str(user_id))) |
        ((Message.sender_id == str(user_id)) & (Message.receiver_id == current_user.id))
    ).order_by(Message.created_at.asc()).all()
    return render_template("dm_chat.html", partner=partner.to_dict(), messages=messages)


# ============================================================
# Schedule & Classes (unchanged logic)
# ============================================================
@app.route("/schedule")
@login_required
def schedule():
    entries = Class_entry.query.filter_by(user_id=current_user.id).all()
    classes_list = []
    for entry in entries:
        c = Class.query.get(entry.class_id)
        if c:
            classes_list.append(c.to_dict())
    classes_list.sort(key=lambda x: x["time"])
    user = User.query.get(current_user.id)
    return render_template("schedule.html", classes=classes_list, user=user.to_dict())


@app.route("/classes")
@login_required
def classes():
    filters = []
    season = request.args.get("season")
    if season == "spring":
        filters.append(Class.is_spring == True)
    elif season == "autumn":
        filters.append(Class.is_autumn == True)
    elif season == "other":
        filters.append(Class.is_spring == False)
        filters.append(Class.is_autumn == False)
    for field, col in [("name", Class.name), ("code", Class.code), ("teacher", Class.teacher)]:
        val = request.args.get(field)
        if val:
            filters.append(col.like(f"%{val}%"))
    for field, col in [("department", Class.department), ("time", Class.time), ("day", Class.day)]:
        val = request.args.get(field)
        if val:
            filters.append(col == val)
    result = Class.query.filter(*filters).limit(500).all()
    return render_template("classes.html", classes=[c.to_dict() for c in result])


@app.route("/class/<uuid:class_id>")
@login_required
def class_detail(class_id):
    c = Class.query.get_or_404(str(class_id))
    entry = Class_entry.query.filter_by(class_id=str(class_id), user_id=current_user.id).first()
    return render_template("class_detail.html", class_detail=c.to_dict(), class_entry=entry)


@app.route("/class/<uuid:class_id>/add")
@login_required
def class_add(class_id):
    cid = str(class_id)
    if not Class_entry.query.filter_by(user_id=current_user.id, class_id=cid).first():
        db.session.add(Class_entry(user_id=current_user.id, class_id=cid))
        db.session.commit()
    return redirect(url_for("schedule"))


@app.route("/class/<uuid:class_id>/delete")
@login_required
def class_delete(class_id):
    entry = Class_entry.query.filter_by(class_id=str(class_id), user_id=current_user.id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()
    return redirect(url_for("schedule"))


# ============================================================
# User & About Me
# ============================================================
@app.route("/user/<uuid:user_id>")
@login_required
def user(user_id):
    uid = str(user_id)
    u = User.query.get_or_404(uid)
    f = Friend.query.filter_by(user_id=current_user.id, friend_id=uid).first()
    posts = Post.query.filter_by(user_id=uid).order_by(Post.created_at.desc()).all()
    return render_template("user.html", user=u.to_dict(), posts=[p.to_dict() for p in posts], friend=f)


@app.route("/aboutme", methods=["POST", "GET"])
@login_required
def aboutme():
    if request.method == "POST":
        u = User.query.get(current_user.id)
        u.name = request.form.get("name", "").strip()
        u.department = request.form.get("department", "").strip()
        db.session.commit()
        return redirect(url_for("aboutme"))
    user = User.query.get(current_user.id)
    return render_template("aboutme.html", user=user.to_dict())


# ============================================================
# Admin Panel (developer only)
# ============================================================
@app.route("/admin")
@admin_required
def admin_dashboard():
    stats = {
        "users": User.query.count(),
        "posts": Post.query.count(),
        "comments": Comment.query.count(),
        "messages": Message.query.count(),
        "friends": Friend.query.count(),
        "classes": Class.query.count(),
    }
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    recent_posts = Post.query.order_by(Post.created_at.desc()).limit(10).all()
    return render_template("admin.html", stats=stats, recent_users=recent_users, recent_posts=recent_posts)


@app.route("/admin/users")
@admin_required
def admin_users():
    page = request.args.get("page", 1, type=int)
    q = request.args.get("q", "").strip()
    query = User.query
    if q:
        query = query.filter(User.username.like(f"%{q}%"))
    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=30, error_out=False)
    return render_template("admin_users.html", users=pagination.items, pagination=pagination, query=q)


@app.route("/admin/user/<uuid:user_id>/delete", methods=["POST"])
@admin_required
def admin_delete_user(user_id):
    uid = str(user_id)
    if uid == current_user.id:
        return redirect(url_for("admin_users"))
    Comment.query.filter_by(user_id=uid).delete()
    Post.query.filter_by(user_id=uid).delete()
    Friend.query.filter((Friend.user_id == uid) | (Friend.friend_id == uid)).delete()
    Message.query.filter((Message.sender_id == uid) | (Message.receiver_id == uid)).delete()
    Class_entry.query.filter_by(user_id=uid).delete()
    u = User.query.get(uid)
    if u:
        db.session.delete(u)
    db.session.commit()
    return redirect(url_for("admin_users"))


@app.route("/admin/posts")
@admin_required
def admin_posts():
    page = request.args.get("page", 1, type=int)
    pagination = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=30, error_out=False)
    return render_template("admin_posts.html", posts=pagination.items, pagination=pagination)


@app.route("/admin/post/<uuid:post_id>/delete", methods=["POST"])
@admin_required
def admin_delete_post(post_id):
    p = Post.query.get(str(post_id))
    if p:
        Comment.query.filter_by(post_id=p.id).delete()
        db.session.delete(p)
        db.session.commit()
    return redirect(url_for("admin_posts"))


# ============================================================
# AI Features (Groq LLaMA 3)
# ============================================================
@app.route("/chatbot")
@login_required
def chatbot():
    return render_template("chatbot.html")


@app.route("/api/ai/chat", methods=["POST"])
@login_required
def api_ai_chat():
    data = request.get_json()
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "question required"}), 400
    answer = campus_chat(question, get_lang())
    return jsonify({"answer": answer})


@app.route("/api/ai/summarize", methods=["POST"])
@login_required
def api_ai_summarize():
    data = request.get_json()
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"error": "content required"}), 400
    summary = summarize_post(content, get_lang())
    return jsonify({"summary": summary})


@app.route("/api/ai/translate", methods=["POST"])
@login_required
def api_ai_translate():
    data = request.get_json()
    text = data.get("text", "").strip()
    target = data.get("target_lang", "en")
    if not text:
        return jsonify({"error": "text required"}), 400
    result = translate_text(text, target)
    return jsonify({"translation": result})


@app.route("/api/ai/moderate", methods=["POST"])
@login_required
def api_ai_moderate():
    data = request.get_json()
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "text required"}), 400
    result = moderate_content(text)
    return jsonify(result)


@app.route("/api/ai/search", methods=["POST"])
@login_required
def api_ai_search():
    data = request.get_json()
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"error": "query required"}), 400
    keywords = extract_search_keywords(query)
    # Search posts using extracted keywords
    results = []
    for kw in keywords:
        posts = Post.query.filter(
            (Post.title.like(f"%{kw}%")) | (Post.content.like(f"%{kw}%"))
        ).limit(10).all()
        results.extend([{**p.to_dict(), "username": p.user.username} for p in posts])
    # Deduplicate
    seen = set()
    unique = []
    for r in results:
        if r["id"] not in seen:
            seen.add(r["id"])
            unique.append(r)
    return jsonify({"keywords": keywords, "posts": unique[:20]})


# ============================================================
# Init & Run
# ============================================================
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
# updated: /api/users/search
