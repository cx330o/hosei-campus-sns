"""
AI features powered by Groq (LLaMA 3).
- Post summarization
- Auto-translation
- Campus chatbot (RAG-lite)
- Content moderation
"""

import os
import json
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

# ============================================================
# Post Summarization
# ============================================================
def summarize_post(content: str, lang: str = "ja") -> str:
    """Summarize a post into 1-2 sentences."""
    prompts = {
        "ja": "以下の投稿を1�?文で要約してください�?,
        "en": "Summarize the following post in 1-2 sentences:",
        "zh": "请用1-2句话总结以下帖子�?,
        "ko": "다음 게시글�?1-2문장으로 요약�?주세�?",
    }
    prompt = prompts.get(lang, prompts["ja"])

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a university SNS platform."},
                {"role": "user", "content": f"{prompt}\n\n{content}"},
            ],
            max_tokens=200,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI] Summarization error: {e}")
        return ""


# ============================================================
# Auto-Translation
# ============================================================
def translate_text(text: str, target_lang: str) -> str:
    """Translate text to the target language."""
    lang_names = {"ja": "Japanese", "en": "English", "zh": "Chinese", "ko": "Korean"}
    target = lang_names.get(target_lang, "Japanese")

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a translator. Translate the following text to {target}. "
                               f"Output ONLY the translation, nothing else.",
                },
                {"role": "user", "content": text},
            ],
            max_tokens=500,
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI] Translation error: {e}")
        return text


# ============================================================
# Campus Chatbot (RAG-lite)
# ============================================================
CAMPUS_KNOWLEDGE = """
法政大学には3つのキャンパスがあります�?
1. 市ヶ谷キャンパス - 法学部、文学部、経済学部、社会学部、経営学部、国際文化学部、人間環境学部、キャリアデザイン学部、グローバル教養学部
2. 小金井キャンパス - 情報科学部、理工学部、生命科学部
3. 多摩キャンパ�?- 現代福祉学部、スポーツ健康学�?

市ヶ谷キャンパスの最寄り駅：市ヶ谷駅（JR総武線、東京メトロ有楽町線・南北線、都営新宿線）、飯田橋駅、九段下�?
小金井キャンパスの最寄り駅：東小金井駅（JR中央線）、武蔵小金井�?
多摩キャンパスの最寄り駅：西八王子駅（バス）、めじろ台駅（バス）、相原駅（バス）

学食情報�?
- 市ヶ谷：ボアソナードタワー地下の学食、外濠校舎のカフ�?
- 小金井：北館の学�?
- 多摩：EGG DOME

図書館：各キャンパスに図書館あり。市ヶ谷は蔵書数が最も多い�?
"""


def campus_chat(question: str, lang: str = "ja") -> str:
    """Answer campus-related questions using RAG-lite approach."""
    system_prompt = (
        "あなたは法政大学のキャンパスアシスタントAIです�?
        "以下の情報を参考に、学生の質問に親切に答えてください�?
        "情報にない質問には「すみません、その情報は持っていません」と答えてください。\n\n"
        f"=== キャンパス情�?===\n{CAMPUS_KNOWLEDGE}"
    )

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
            max_tokens=500,
            temperature=0.5,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[AI] Chatbot error: {e}")
        return "すみません、エラーが発生しました。もう一度お試しください�?


# ============================================================
# Content Moderation
# ============================================================
def moderate_content(text: str) -> dict:
    """Check if content is appropriate for a university SNS."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a content moderator for a university SNS. "
                        "Analyze the following text and respond with JSON: "
                        '{"safe": true/false, "reason": "explanation if unsafe", "category": "ok/spam/harassment/inappropriate"}'
                        " Output ONLY valid JSON."
                    ),
                },
                {"role": "user", "content": text},
            ],
            max_tokens=100,
            temperature=0.1,
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception:
        return {"safe": True, "reason": "", "category": "ok"}


# ============================================================
# Smart Search (Semantic-like keyword extraction)
# ============================================================
def extract_search_keywords(query: str) -> list[str]:
    """Extract search keywords from natural language query."""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract 3-5 search keywords from the user's query. "
                        "Return as JSON array of strings. Output ONLY the JSON array."
                    ),
                },
                {"role": "user", "content": query},
            ],
            max_tokens=100,
            temperature=0.1,
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception:
        return [query]
# updated: ����åȥܥåȤΥ���`�ϥ�ɥ��
