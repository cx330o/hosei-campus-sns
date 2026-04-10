"""Internationalization support for 4 languages: ja, en, zh, ko"""

TRANSLATIONS = {
    # App name & general
    "app_name": {"ja": "法政SNS", "en": "Hosei SNS", "zh": "法政SNS", "ko": "호세이 SNS"},
    "home": {"ja": "ホーム", "en": "Home", "zh": "首页", "ko": "홈"},
    "friends": {"ja": "フレンド", "en": "Friends", "zh": "好友", "ko": "친구"},
    "schedule": {"ja": "時間割", "en": "Schedule", "zh": "课程表", "ko": "시간표"},
    "about_me": {"ja": "マイページ", "en": "My Page", "zh": "我的页面", "ko": "마이페이지"},
    "ai_chat": {"ja": "AI", "en": "AI", "zh": "AI", "ko": "AI"},
    "login": {"ja": "ログイン", "en": "Login", "zh": "登录", "ko": "로그인"},
    "logout": {"ja": "ログアウト", "en": "Logout", "zh": "退出", "ko": "로그아웃"},
    "signup": {"ja": "新規登録", "en": "Sign Up", "zh": "注册", "ko": "회원가입"},
    "logged_in_as": {"ja": "ログイン中", "en": "Logged in", "zh": "已登录", "ko": "로그인 중"},

    # Auth
    "username": {"ja": "ユーザー名", "en": "Username", "zh": "用户名", "ko": "사용자명"},
    "password": {"ja": "パスワード", "en": "Password", "zh": "密码", "ko": "비밀번호"},
    "email": {"ja": "メールアドレス", "en": "Email", "zh": "邮箱", "ko": "이메일"},
    "department": {"ja": "学部", "en": "Department", "zh": "学部", "ko": "학부"},
    "login_prompt": {
        "ja": "ユーザー名とパスワードを入力してください",
        "en": "Enter your username and password",
        "zh": "请输入用户名和密码",
        "ko": "사용자명과 비밀번호를 입력하세요",
    },
    "no_account": {
        "ja": "アカウントをお持ちでない方は",
        "en": "Don't have an account?",
        "zh": "没有账号？",
        "ko": "계정이 없으신가요?",
    },
    "has_account": {
        "ja": "アカウントをお持ちの方は",
        "en": "Already have an account?",
        "zh": "已有账号？",
        "ko": "이미 계정이 있으신가요?",
    },
    "here": {"ja": "こちら", "en": "here", "zh": "这里", "ko": "여기"},
    "login_failed": {
        "ja": "ユーザー名またはパスワードが正しくありません",
        "en": "Invalid username or password",
        "zh": "用户名或密码错误",
        "ko": "사용자명 또는 비밀번호가 올바르지 않습니다",
    },
    "username_taken": {
        "ja": "このユーザー名は既に使用されています",
        "en": "This username is already taken",
        "zh": "该用户名已被使用",
        "ko": "이 사용자명은 이미 사용 중입니다",
    },

    # Posts
    "posts": {"ja": "投稿一覧", "en": "Posts", "zh": "帖子列表", "ko": "게시글 목록"},
    "create_post": {"ja": "投稿作成", "en": "New Post", "zh": "发帖", "ko": "새 게시글"},
    "title": {"ja": "タイトル", "en": "Title", "zh": "标题", "ko": "제목"},
    "content": {"ja": "内容", "en": "Content", "zh": "内容", "ko": "내용"},
    "post_btn": {"ja": "投稿する", "en": "Post", "zh": "发布", "ko": "게시"},
    "delete": {"ja": "削除", "en": "Delete", "zh": "删除", "ko": "삭제"},
    "detail": {"ja": "詳細", "en": "Detail", "zh": "详情", "ko": "상세"},
    "user_page": {"ja": "ユーザーページ", "en": "User Page", "zh": "用户页面", "ko": "사용자 페이지"},
    "no_posts": {"ja": "投稿がありません", "en": "No posts yet", "zh": "暂无帖子", "ko": "게시글이 없습니다"},

    # Friends
    "friend_list": {"ja": "フレンド一覧", "en": "Friend List", "zh": "好友列表", "ko": "친구 목록"},
    "add_friend": {"ja": "フレンド追加", "en": "Add Friend", "zh": "添加好友", "ko": "친구 추가"},
    "remove_friend": {"ja": "フレンド解除", "en": "Remove Friend", "zh": "删除好友", "ko": "친구 삭제"},
    "no_friends": {"ja": "フレンドがいません", "en": "No friends yet", "zh": "暂无好友", "ko": "친구가 없습니다"},

    # Schedule
    "spring": {"ja": "春学期", "en": "Spring", "zh": "春季学期", "ko": "봄학기"},
    "autumn": {"ja": "秋学期", "en": "Autumn", "zh": "秋季学期", "ko": "가을학기"},
    "other_term": {
        "ja": "その他",
        "en": "Other",
        "zh": "其他",
        "ko": "기타",
    },
    "intensive": {"ja": "集中・その他", "en": "Intensive/Other", "zh": "集中/其他", "ko": "집중/기타"},
    "add": {"ja": "追加", "en": "Add", "zh": "添加", "ko": "추가"},
    "period": {"ja": "限", "en": "", "zh": "节", "ko": "교시"},
    "mon": {"ja": "月", "en": "Mon", "zh": "一", "ko": "월"},
    "tue": {"ja": "火", "en": "Tue", "zh": "二", "ko": "화"},
    "wed": {"ja": "水", "en": "Wed", "zh": "三", "ko": "수"},
    "thu": {"ja": "木", "en": "Thu", "zh": "四", "ko": "목"},
    "fri": {"ja": "金", "en": "Fri", "zh": "五", "ko": "금"},
    "sat": {"ja": "土", "en": "Sat", "zh": "六", "ko": "토"},

    # Classes
    "class_list": {"ja": "授業一覧", "en": "Class List", "zh": "课程列表", "ko": "수업 목록"},
    "class_name": {"ja": "授業名", "en": "Class Name", "zh": "课程名", "ko": "수업명"},
    "class_code": {"ja": "授業コード", "en": "Class Code", "zh": "课程代码", "ko": "수업 코드"},
    "period_label": {"ja": "時限", "en": "Period", "zh": "节次", "ko": "교시"},
    "day_label": {"ja": "曜日", "en": "Day", "zh": "星期", "ko": "요일"},
    "classroom": {"ja": "教室", "en": "Classroom", "zh": "教室", "ko": "교실"},
    "credits": {"ja": "単位", "en": "Credits", "zh": "学分", "ko": "학점"},
    "teacher": {"ja": "講師", "en": "Instructor", "zh": "讲师", "ko": "강사"},
    "grade_min": {"ja": "配当年次(最小)", "en": "Min Grade", "zh": "最低年级", "ko": "최소 학년"},
    "grade_max": {"ja": "配当年次(最大)", "en": "Max Grade", "zh": "最高年级", "ko": "최대 학년"},
    "syllabus": {"ja": "シラバス", "en": "Syllabus", "zh": "教学大纲", "ko": "강의계획서"},
    "notes": {"ja": "備考", "en": "Notes", "zh": "备注", "ko": "비고"},
    "register_class": {"ja": "授業を登録", "en": "Register", "zh": "注册课程", "ko": "수업 등록"},
    "unregister_class": {"ja": "授業を削除", "en": "Unregister", "zh": "取消课程", "ko": "수업 삭제"},
    "back_to_schedule": {"ja": "時間割に戻る", "en": "Back to Schedule", "zh": "返回课程表", "ko": "시간표로 돌아가기"},
    "search": {"ja": "検索", "en": "Search", "zh": "搜索", "ko": "검색"},
    "search_class": {"ja": "授業を検索", "en": "Search Classes", "zh": "搜索课程", "ko": "수업 검색"},
    "season_label": {"ja": "開講時期", "en": "Term", "zh": "开课时期", "ko": "개강 시기"},

    # About me
    "display_name": {"ja": "表示名", "en": "Display Name", "zh": "显示名称", "ko": "표시 이름"},
    "update": {"ja": "更新", "en": "Update", "zh": "更新", "ko": "업데이트"},
    "language": {"ja": "言語", "en": "Language", "zh": "语言", "ko": "언어"},

    # Roles
    "select_role": {"ja": "ログイン方法を選択", "en": "Select Login Type", "zh": "选择登录方式", "ko": "로그인 유형 선택"},
    "student_login": {"ja": "学生ログイン", "en": "Student Login", "zh": "学生登录", "ko": "학생 로그인"},
    "teacher_login": {"ja": "教員ログイン", "en": "Teacher Login", "zh": "教师登录", "ko": "교원 로그인"},
    "developer_login": {"ja": "開発者ログイン", "en": "Developer Login", "zh": "开发者登录", "ko": "개발자 로그인"},
    "student_desc": {"ja": "法政大学の学生アカウントでログイン", "en": "Login with your Hosei student account", "zh": "使用法政大学学生账号登录", "ko": "호세이대학 학생 계정으로 로그인"},
    "teacher_desc": {"ja": "法政大学の教員アカウントでログイン", "en": "Login with your Hosei faculty account", "zh": "使用法政大学教师账号登录", "ko": "호세이대학 교원 계정으로 로그인"},
    "developer_desc": {"ja": "システム管理者用ログイン", "en": "System administrator login", "zh": "系统管理员登录", "ko": "시스템 관리자 로그인"},
    "student": {"ja": "学生", "en": "Student", "zh": "学生", "ko": "학생"},
    "teacher_role": {"ja": "教員", "en": "Teacher", "zh": "教师", "ko": "교원"},
    "developer": {"ja": "開発者", "en": "Developer", "zh": "开发者", "ko": "개발자"},
    "student_signup": {"ja": "学生新規登録", "en": "Student Sign Up", "zh": "学生注册", "ko": "학생 회원가입"},
    "teacher_signup": {"ja": "教員新規登録", "en": "Teacher Sign Up", "zh": "教师注册", "ko": "교원 회원가입"},
    "back": {"ja": "戻る", "en": "Back", "zh": "返回", "ko": "뒤로"},

    # Comments
    "comments": {"ja": "コメント", "en": "Comments", "zh": "评论", "ko": "댓글"},
    "write_comment": {"ja": "コメントを書く", "en": "Write a comment", "zh": "写评论", "ko": "댓글 작성"},
    "comment_btn": {"ja": "送信", "en": "Send", "zh": "发送", "ko": "전송"},
    "image_url": {"ja": "画像URL（任意）", "en": "Image URL (optional)", "zh": "图片链接（可选）", "ko": "이미지 URL (선택)"},
    "upload_image": {"ja": "画像をアップロード", "en": "Upload image", "zh": "上传图片", "ko": "이미지 업로드"},
    "no_comments": {"ja": "コメントはまだありません", "en": "No comments yet", "zh": "暂无评论", "ko": "아직 댓글이 없습니다"},
    "comment_count": {"ja": "件のコメント", "en": "comments", "zh": "条评论", "ko": "개 댓글"},

    # DM
    "dm": {"ja": "メッセージ", "en": "Messages", "zh": "私信", "ko": "메시지"},
    "dm_list": {"ja": "メッセージ一覧", "en": "Messages", "zh": "私信列表", "ko": "메시지 목록"},
    "no_messages": {"ja": "メッセージはありません", "en": "No messages yet", "zh": "暂无私信", "ko": "메시지가 없습니다"},
    "type_message": {"ja": "メッセージを入力...", "en": "Type a message...", "zh": "输入消息...", "ko": "메시지 입력..."},
    "send_dm": {"ja": "送信", "en": "Send", "zh": "发送", "ko": "전송"},
    "send_message": {"ja": "メッセージを送る", "en": "Send Message", "zh": "发送私信", "ko": "메시지 보내기"},
    "unread": {"ja": "未読", "en": "unread", "zh": "未读", "ko": "읽지 않음"},

    # Search
    "search_users": {"ja": "ユーザー検索", "en": "Search Users", "zh": "搜索用户", "ko": "사용자 검색"},
    "search_placeholder": {"ja": "ユーザー名で検索...", "en": "Search by username...", "zh": "按用户名搜索...", "ko": "사용자명으로 검색..."},
    "no_results": {"ja": "結果がありません", "en": "No results", "zh": "没有结果", "ko": "결과 없음"},

    # Admin
    "admin": {"ja": "管理パネル", "en": "Admin Panel", "zh": "管理面板", "ko": "관리 패널"},
    "admin_dashboard": {"ja": "ダッシュボード", "en": "Dashboard", "zh": "仪表盘", "ko": "대시보드"},
    "admin_users": {"ja": "ユーザー管理", "en": "User Management", "zh": "用户管理", "ko": "사용자 관리"},
    "admin_posts": {"ja": "投稿管理", "en": "Post Management", "zh": "帖子管理", "ko": "게시글 관리"},
    "total": {"ja": "合計", "en": "Total", "zh": "总计", "ko": "합계"},
    "recent": {"ja": "最近", "en": "Recent", "zh": "最近", "ko": "최근"},
    "confirm_delete": {"ja": "本当に削除しますか？", "en": "Are you sure?", "zh": "确定删除？", "ko": "정말 삭제하시겠습니까?"},
    "prev": {"ja": "前へ", "en": "Prev", "zh": "上一页", "ko": "이전"},
    "next_page": {"ja": "次へ", "en": "Next", "zh": "下一页", "ko": "다음"},

    # AI / Chatbot
    "chatbot_title": {"ja": "キャンパスAIアシスタント", "en": "Campus AI Assistant", "zh": "校园AI助手", "ko": "캠퍼스 AI 어시스턴트"},
    "chatbot_desc": {
        "ja": "キャンパスに関する質問をAIに聞いてみましょう！",
        "en": "Ask the AI about anything campus-related!",
        "zh": "向AI询问任何校园相关的问题！",
        "ko": "캠퍼스에 관한 질문을 AI에게 물어보세요!",
    },
    "chatbot_greeting": {
        "ja": "こんにちは！法政大学のキャンパスについて何でも聞いてください。学食、図書館、交通アクセスなど、お答えします！",
        "en": "Hello! Ask me anything about Hosei University campuses. I can help with cafeterias, libraries, transportation, and more!",
        "zh": "你好！请随时问我关于法政大学校园的任何问题。食堂、图书馆、交通等，我都可以回答！",
        "ko": "안녕하세요! 호세이대학 캠퍼스에 대해 무엇이든 물어보세요. 학식, 도서관, 교통 등 도움을 드릴게요!",
    },
    "chatbot_placeholder": {
        "ja": "質問を入力してください...",
        "en": "Type your question...",
        "zh": "请输入您的问题...",
        "ko": "질문을 입력하세요...",
    },
    "ai_summarize": {"ja": "AI要約", "en": "AI Summary", "zh": "AI摘要", "ko": "AI 요약"},
    "ai_translate": {"ja": "AI翻訳", "en": "AI Translate", "zh": "AI翻译", "ko": "AI 번역"},
    "ai_search": {"ja": "AI検索", "en": "AI Search", "zh": "AI搜索", "ko": "AI 검색"},

    # Errors
    "error_occurred": {"ja": "エラーが発生しました", "en": "An error occurred", "zh": "发生错误", "ko": "오류가 발생했습니다"},
    "page_not_found": {"ja": "ページが見つかりません", "en": "Page not found", "zh": "页面未找到", "ko": "페이지를 찾을 수 없습니다"},
    "go_home": {"ja": "ホームに戻る", "en": "Go Home", "zh": "返回首页", "ko": "홈으로 돌아가기"},
    "login_required": {
        "ja": "ログインが必要です",
        "en": "Login required",
        "zh": "需要登录",
        "ko": "로그인이 필요합니다",
    },
}


def t(key, lang="ja"):
    """Get translation for key in given language, fallback to Japanese."""
    entry = TRANSLATIONS.get(key, {})
    return entry.get(lang, entry.get("ja", key))
