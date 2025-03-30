"""
Generate fake users, posts, friends, and class entries to simulate an active community.
Run: python seed.py
"""
import random
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from app import app, db
from models import User, Post, Friend, Comment, Message

# --- Config ---
NUM_USERS = 40
NUM_POSTS = 200
NUM_FRIENDSHIPS = 80
PASSWORD = generate_password_hash("password123", method="pbkdf2:sha256")

DEPARTMENTS = [
    "法学部", "文学部", "経済学部", "社会学部", "経営学部",
    "国際文化学部", "人間環境学部", "現代福祉学部", "情報科学部",
    "キャリアデザイン学部", "理工学部", "生命科学部",
    "グローバル教養学部", "スポーツ健康学部",
]

# Realistic Japanese-style usernames
USERNAMES = [
    "yuki_t", "haruto22", "sakura_m", "ren_k", "aoi_s",
    "sota_n", "hina_y", "kaito_w", "mio_tanaka", "riku_03",
    "akari_h", "yuto_i", "honoka_f", "takumi_s", "ema_k",
    "daiki_m", "riko_a", "shun_o", "nana_u", "koki_y",
    "miyu_ito", "hayato_n", "saki_w", "ryota_k", "moe_s",
    "kenji_t", "ayaka_m", "tsubasa_h", "chihiro_f", "naoki_a",
    "mai_suzuki", "kosei_y", "yuna_o", "shin_k", "asuka_n",
    "tomoya_w", "kanon_i", "ryusei_m", "hinata_t", "sora_k",
]

POST_TITLES_JA = [
    "今日の授業めっちゃ面白かった", "テスト勉強やばい…", "学食の新メニュー最高",
    "サークル新歓の情報共有", "図書館の席取り合戦", "レポート終わらない助けて",
    "来週の飲み会参加する人〜", "バイト先探してます", "春学期の時間割どうする？",
    "プログラミングの課題わからん", "就活始めた人いる？", "ゼミの発表準備中",
    "キャンパス周辺のおすすめランチ", "TOEICの勉強法教えて", "文化祭の準備始まった",
    "夏休みの予定", "インターン情報求む", "新しいカフェ見つけた",
    "履修登録のコツ", "先輩からのアドバイス求む", "部活の大会近い",
    "留学について相談したい", "卒論テーマ決まらない", "おすすめの参考書",
    "通学時間長すぎ問題", "サークル合宿楽しかった", "期末テストの範囲確認",
    "研究室配属どうだった？", "アルバイトと学業の両立", "友達と勉強会開催",
    "大学祭のステージ出る人", "奨学金の申請忘れずに", "空きコマの過ごし方",
    "新入生へのメッセージ", "卒業旅行の計画", "授業評価アンケート書いた？",
    "学部変更考えてる人いる？", "オンライン授業の感想", "キャンパスの桜きれい",
    "試験期間のストレス解消法",
]

POST_CONTENTS_JA = [
    "今日の2限の講義、教授の話が面白すぎて時間があっという間だった。来週も楽しみ！",
    "テスト範囲広すぎない？？誰かノート見せてくれる人いませんか…",
    "学食のチキン南蛮定食が新しくなってた。ボリュームすごいしコスパ最高。みんな食べてみて。",
    "新歓イベント来週の水曜日にやります！場所は学生会館の3階です。気軽に来てね〜",
    "朝イチで図書館行ったのにもう満席だった。テスト前はほんとに戦争だよね。",
    "レポート3000字って聞いてたのに実質5000字必要じゃん…締め切り明日なのに。",
    "金曜の夜に飲み会企画してます！場所は市ヶ谷駅周辺で。参加したい人はDMください。",
    "週3くらいで入れるバイト探してます。大学の近くだと嬉しいです。おすすめあったら教えて！",
    "春学期の時間割、月曜1限入れるか迷ってる。朝起きれる自信がない…",
    "Pythonの課題、エラーが全然解決しない。誰かプログラミング得意な人助けて〜",
    "3年になったし就活そろそろ始めないと。インターンの情報とか共有しませんか？",
    "ゼミの中間発表が来週。パワポ作り始めたけど全然まとまらない。",
    "キャンパスの裏にある定食屋さん、安くて美味しいからおすすめ。日替わりランチ500円。",
    "TOEIC800点目指してるんだけど、リスニングが伸びない。いい勉強法ないかな？",
    "文化祭の実行委員やってます。今年のテーマ決まりました！詳細は後日発表します。",
    "夏休みに短期留学行こうか迷ってる。行ったことある人、感想聞かせて！",
    "IT企業のインターン情報まとめてます。興味ある人いたらシェアします。",
    "駅前に新しくできたカフェ、Wi-Fiあるし電源もあるから勉強に最適。",
    "履修登録のポイント：人気の授業は抽選になるから第2希望まで考えておくといいよ。",
    "4年の先輩に聞いたんだけど、この授業は出席重視らしい。サボらないようにしよう。",
    "来月の大会に向けて毎日練習してる。応援よろしくお願いします！",
    "交換留学の説明会に行ってきた。思ったより手続き多いけど、挑戦してみたい。",
    "卒論のテーマ、3つ候補があるんだけど絞れない。誰か相談乗ってくれませんか。",
    "この教科書、メルカリで半額で買えた。新品買う前にチェックしてみて。",
    "片道1時間半の通学がつらい。一人暮らし始めようか本気で悩んでる。",
    "サークル合宿で箱根行ってきた！温泉最高だったし、みんなと仲良くなれた。",
    "期末テストの範囲、教授がさらっと言ってたけどメモした人いる？",
    "研究室配属の希望出した。第1希望通るといいな…",
    "バイトと授業の両立、コツは空きコマを有効活用すること。図書館で課題やるのがおすすめ。",
    "今週末、図書館で勉強会やります。一人だとサボっちゃう人、一緒にやろう！",
    "大学祭のバンドステージ出ます！見に来てくれたら嬉しいです。",
    "奨学金の申請期限来週までだよ。忘れてる人いたら急いで！",
    "空きコマ、カフェテリアでだらだらしがち。もっと有効に使いたい。",
    "新入生のみなさん、大学生活楽しんでね。困ったことがあったら気軽に聞いてください！",
    "卒業旅行、ヨーロッパ周遊を計画中。一緒に行く人募集してます。",
    "授業評価アンケート、ちゃんと書くと来年の授業改善につながるらしいよ。",
    "転学部って実際どうなんだろう。経験者いたら話聞きたいです。",
    "オンライン授業、通学時間なくて楽だけど集中力が続かない…",
    "キャンパスの桜が満開！お昼に友達とお花見した。写真撮りまくった。",
    "試験期間のストレス、運動で発散してる。ジム行くとスッキリするよ。",
]

POST_TITLES_EN = [
    "Great lecture today", "Study group anyone?", "Best ramen near campus",
    "Club recruitment event", "Library is packed", "Need help with assignment",
    "Weekend plans?", "Part-time job recommendations", "Course registration tips",
    "Coding homework help", "Internship hunting", "Presentation prep",
    "Lunch spot recommendations", "TOEIC study tips", "Festival planning update",
]

POST_CONTENTS_EN = [
    "Had an amazing lecture in my sociology class today. The professor really knows how to make it engaging.",
    "Anyone want to form a study group for the midterm? I'm thinking we could meet at the library.",
    "Found this incredible ramen shop just 5 minutes from campus. The tonkotsu is unreal.",
    "Our club is having a welcome event next week. Everyone is welcome to join!",
    "Got to the library at 8am and it was already full. Exam season is no joke.",
    "Can someone explain the difference between merge sort and quick sort? I'm so confused.",
    "Planning a BBQ this weekend at the park. Who's in?",
    "Looking for a part-time job near campus. Flexible hours preferred. Any leads?",
    "Pro tip: always have a backup plan for course registration. Popular classes fill up fast.",
    "This Python assignment is killing me. Anyone good at recursion?",
    "Started applying for summer internships. The competition is fierce this year.",
    "Working on my seminar presentation. Any tips for public speaking?",
    "The cafeteria's new menu is actually pretty good. The curry rice is a must-try.",
    "Scored 750 on TOEIC! Here's what worked for me: daily listening practice and lots of reading.",
    "Festival committee meeting went well. We have some exciting plans this year!",
]

POST_TITLES_ZH = [
    "今天的课太有意思了", "考试复习求组队", "校园附近美食推荐",
    "社团招新啦", "图书馆又满了", "作业求助",
    "周末有什么安排", "找兼职中", "选课经验分享",
    "编程作业救命", "实习信息分享", "发表准备中",
]

POST_CONTENTS_ZH = [
    "今天的经济学课教授讲得特别好，两个小时一下子就过去了。",
    "有人想一起组队复习期中考试吗？可以在图书馆一起学习。",
    "校门口新开了一家中餐馆，味道很正宗，推荐大家去试试。",
    "我们社团下周三有招新活动，欢迎大家来参加！",
    "早上八点到图书馆已经没位置了，考试周真的太卷了。",
    "这个编程作业完全看不懂，有没有大佬能帮忙看看？",
    "周末打算去东京塔玩，有人一起吗？",
    "在找校园附近的兼职，最好是能练日语的那种。",
    "选课建议：热门课程一定要提前准备第二志愿。",
    "Python的递归真的好难理解，有没有好的学习资料推荐？",
    "整理了一些IT公司的实习信息，需要的同学可以找我。",
    "下周要做课堂发表，PPT还没开始做，好焦虑。",
]

POST_TITLES_KO = [
    "오늘 수업 너무 재밌었다", "시험 공부 같이 할 사람", "캠퍼스 맛집 추천",
    "동아리 신입 모집", "도서관 자리 없음", "과제 도와주세요",
    "주말 계획 있어요?", "아르바이트 구합니다", "수강신청 팁",
    "코딩 과제 어려워요", "인턴 정보 공유", "발표 준비 중",
]

POST_CONTENTS_KO = [
    "오늘 사회학 수업이 정말 재미있었어요. 교수님 설명이 너무 좋았습니다.",
    "중간고사 같이 공부할 사람 구합니다. 도서관에서 만나요!",
    "캠퍼스 근처에 새로 생긴 한식당 맛있어요. 김치찌개 추천합니다.",
    "우리 동아리 다음 주에 신입 환영회 합니다. 관심 있는 분 오세요!",
    "아침 일찍 갔는데 도서관 만석이었어요. 시험 기간은 정말 힘들어요.",
    "이 프로그래밍 과제 전혀 모르겠어요. 도와줄 수 있는 분 계신가요?",
    "주말에 시부야 놀러 갈 건데 같이 갈 사람 있나요?",
    "캠퍼스 근처에서 아르바이트 찾고 있어요. 추천해 주세요.",
    "수강신청 팁: 인기 과목은 꼭 2지망까지 준비하세요.",
    "파이썬 재귀 함수가 너무 어려워요. 좋은 자료 있으면 공유해 주세요.",
    "IT 기업 인턴 정보 정리했어요. 필요한 분은 연락 주세요.",
    "다음 주 발표인데 PPT 아직 시작도 못 했어요. 큰일이다.",
]

def random_past_time(days_back=180):
    """Generate a random datetime within the last N days."""
    now = datetime.now()
    delta = timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )
    return now - delta


def main():
    with app.app_context():
        # Clear existing data
        Comment.query.delete()
        Post.query.delete()
        Friend.query.delete()
        User.query.delete()
        db.session.commit()
        print("Cleared existing data.")

        # Create users
        users = []
        for i in range(NUM_USERS):
            role = "student" if i < 30 else "teacher"
            u = User(
                username=USERNAMES[i],
                email=f"{USERNAMES[i]}@stu.hosei.ac.jp",
                password=PASSWORD,
                name=USERNAMES[i].split("_")[0].capitalize(),
                department=random.choice(DEPARTMENTS),
                lang=random.choice(["ja", "ja", "ja", "en", "zh", "ko"]),
                role=role,
            )
            u.created_at = random_past_time(365)
            db.session.add(u)
            users.append(u)

        # Create the single developer account
        dev = User(
            username="admin",
            email="admin@hosei-sns.dev",
            password=PASSWORD,
            name="Admin",
            department="開発チーム",
            lang="ja",
            role="developer",
        )
        dev.created_at = random_past_time(365)
        db.session.add(dev)

        db.session.commit()
        print(f"Created {len(users)} users + 1 developer account (admin).")

        # Create posts spread over time
        all_titles = (
            [(t, c) for t, c in zip(POST_TITLES_JA, POST_CONTENTS_JA)]
            + [(t, c) for t, c in zip(POST_TITLES_EN, POST_CONTENTS_EN)]
            + [(t, c) for t, c in zip(POST_TITLES_ZH, POST_CONTENTS_ZH)]
            + [(t, c) for t, c in zip(POST_TITLES_KO, POST_CONTENTS_KO)]
        )
        posts_created = 0
        for _ in range(NUM_POSTS):
            title, content = random.choice(all_titles)
            author = random.choice(users)
            p = Post(
                title=title,
                content=content,
                ip="192.168.1." + str(random.randint(1, 254)),
                user_id=author.id,
            )
            p.created_at = random_past_time(180)
            db.session.add(p)
            posts_created += 1
        db.session.commit()
        print(f"Created {posts_created} posts.")

        # Create friendships
        friendships = set()
        created = 0
        attempts = 0
        while created < NUM_FRIENDSHIPS and attempts < 500:
            a, b = random.sample(users, 2)
            key = (a.id, b.id)
            if key not in friendships:
                friendships.add(key)
                f = Friend(user_id=a.id, friend_id=b.id)
                f.created_at = random_past_time(150)
                db.session.add(f)
                created += 1
            attempts += 1
        db.session.commit()
        print(f"Created {created} friendships.")

        # Create comments (some with images)
        COMMENTS_JA = [
            "めっちゃわかる！", "それな〜", "いいね👍", "参考になります！",
            "自分も同じこと思ってた", "詳しく教えて！", "ありがとう！助かる",
            "うちのゼミでも話題になってた", "来週一緒にやろう！", "わかりみが深い",
            "マジで？知らなかった", "情報ありがとう！", "私も行きたい！",
            "すごいね！", "頑張って！応援してる", "それ気になってた",
            "同じ学部だ！よろしく", "写真きれい！", "うらやましい〜",
            "テスト頑張ろう…", "神情報すぎる", "DMしていい？",
        ]
        COMMENTS_EN = [
            "So true!", "Thanks for sharing!", "I totally agree",
            "This is really helpful", "Count me in!", "Great info 👍",
            "Same here lol", "Can you tell me more?", "Awesome!",
            "I had the same experience", "Good luck!", "Nice photo!",
        ]
        COMMENTS_ZH = [
            "太对了！", "谢谢分享！", "我也是这么想的",
            "好有用的信息", "算我一个！", "太棒了👍",
            "哈哈我也是", "能详细说说吗？", "加油！",
            "拍得好好看", "羡慕了", "收藏了！",
        ]
        COMMENTS_KO = [
            "완전 공감!", "공유 감사합니다!", "저도 같은 생각이에요",
            "정말 도움이 돼요", "저도 참가할게요!", "좋은 정보 👍",
            "ㅋㅋ 저도요", "더 자세히 알려주세요!", "대박!",
            "사진 예쁘다!", "부럽다~", "저장했어요!",
        ]
        all_comments = COMMENTS_JA + COMMENTS_EN + COMMENTS_ZH + COMMENTS_KO

        # Picsum image URLs for some comments (campus/study themed seeds)
        COMMENT_IMAGES = [
            "https://picsum.photos/seed/campus1/400/300",
            "https://picsum.photos/seed/campus2/400/300",
            "https://picsum.photos/seed/study1/400/300",
            "https://picsum.photos/seed/library1/400/300",
            "https://picsum.photos/seed/food1/400/300",
            "https://picsum.photos/seed/sakura1/400/300",
            "https://picsum.photos/seed/cafe1/400/300",
            "https://picsum.photos/seed/tokyo1/400/300",
            "https://picsum.photos/seed/sunset1/400/300",
            "https://picsum.photos/seed/books1/400/300",
            "https://picsum.photos/seed/ramen1/400/300",
            "https://picsum.photos/seed/park1/400/300",
            "https://picsum.photos/seed/train1/400/300",
            "https://picsum.photos/seed/night1/400/300",
            "https://picsum.photos/seed/class1/400/300",
        ]

        all_posts = Post.query.all()
        comments_created = 0
        for p in all_posts:
            num_comments = random.choices([0, 1, 2, 3, 4, 5, 7], weights=[5, 15, 25, 25, 15, 10, 5])[0]
            for _ in range(num_comments):
                commenter = random.choice(users)
                text = random.choice(all_comments)
                img = ""
                if random.random() < 0.15:  # 15% of comments have images
                    img = random.choice(COMMENT_IMAGES)
                c = Comment(
                    post_id=p.id,
                    user_id=commenter.id,
                    content=text,
                    image_url=img,
                )
                c.created_at = p.created_at + timedelta(
                    hours=random.randint(0, 72),
                    minutes=random.randint(0, 59),
                )
                db.session.add(c)
                comments_created += 1
        db.session.commit()
        print(f"Created {comments_created} comments.")

        # Create DM conversations
        DM_TEXTS = [
            "やっほー！", "元気？", "今日の授業どうだった？", "ありがとう！",
            "了解！", "明日暇？", "ランチ行かない？", "OK！",
            "Hey!", "What's up?", "Thanks!", "See you tomorrow!",
            "你好！", "谢谢！", "明天见！", "好的！",
            "안녕!", "고마워!", "내일 보자!", "알겠어!",
            "宿題終わった？", "まだ…", "一緒にやろう！", "いいね！",
            "テスト勉強してる？", "全然してない笑", "やばいね", "頑張ろう",
        ]
        dm_created = 0
        for _ in range(30):
            a, b = random.sample(users, 2)
            num_msgs = random.randint(3, 12)
            base_time = random_past_time(60)
            for j in range(num_msgs):
                sender, receiver = (a, b) if j % 2 == 0 else (b, a)
                m = Message(
                    sender_id=sender.id, receiver_id=receiver.id,
                    content=random.choice(DM_TEXTS),
                    is_read=random.random() < 0.7,
                )
                m.created_at = base_time + timedelta(minutes=j * random.randint(1, 30))
                db.session.add(m)
                dm_created += 1
        db.session.commit()
        print(f"Created {dm_created} DM messages.")

        print("Done! All users have password: password123")


if __name__ == "__main__":
    main()
