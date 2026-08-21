import os
import json
import logging
import uuid
from typing import Dict, Any, Optional

logger = logging.getLogger("ai_service")

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

CATEGORIES = [
    "Roads",
    "Water Supply",
    "Sanitation",
    "Streetlights",
    "Drainage",
    "Garbage",
    "Public Infrastructure",
    "Other"
]

DEPARTMENTS_MAP = {
    "Roads": "Roads & Public Works Department",
    "Water Supply": "Water Supply & Sewerage Board",
    "Sanitation": "Sanitation & Solid Waste Management",
    "Streetlights": "Electrical & Streetlighting Division",
    "Drainage": "Drainage & Flood Management Wing",
    "Garbage": "Sanitation & Solid Waste Management",
    "Public Infrastructure": "Town Planning & Public Infrastructure",
    "Other": "General Civic Grievance Cell"
}


def _rule_based_fallback(text: str, user_category: Optional[str]) -> Dict[str, Any]:
    """Multilingual rule-based fallback classifier."""
    lower_text = text.lower()
    detected_lang = "English"
    translated = text
    priority = "Medium"
    category = user_category or "Other"

    if any(0x0980 <= ord(c) <= 0x09FF for c in text):
        detected_lang = "Bengali"
        if "গর্ত" in text or "রাস্তা" in text:
            translated = "There is a severe road breakage and large pothole hazard on the street."
            category = "Roads"
            priority = "High"
        elif "বাতি" in text or "আলো" in text:
            translated = "Streetlight has failed and pole is completely dark with dangling wires."
            category = "Streetlights"
            priority = "High"
    elif any(0x0900 <= ord(c) <= 0x097F for c in text):
        detected_lang = "Hindi"
        if "सड़क" in text or "गड्ढा" in text:
            translated = "Road is severely damaged with large potholes causing traffic hazard."
            category = "Roads"
            priority = "High"
        elif "पानी" in text or "लीकेज" in text:
            translated = "Water pipeline leakage flooding the residential area."
            category = "Water Supply"
            priority = "High"
        elif "कचरा" in text or "गंदगी" in text:
            translated = "Heavy garbage dump accumulation on the roadside."
            category = "Garbage"
            priority = "Medium"
        elif "लाइट" in text or "अंधेरा" in text:
            translated = "Streetlight has malfunctioned causing complete darkness at night."
            category = "Streetlights"
            priority = "Medium"
    elif any(0x0B80 <= ord(c) <= 0x0BFF for c in text):
        detected_lang = "Tamil"
        category = "Roads"
        translated = "Civic grievance reported regarding road and drainage conditions."

    if any(k in lower_text for k in ["pothole", "broken road", "crater", "asphalt", "accident hazard", "tar"]):
        category = "Roads"
        priority = "High"
    elif any(k in lower_text for k in ["pipeline", "water supply", "drinking water", "leakage", "burst pipe", "contamination"]):
        category = "Water Supply"
        priority = "High"
    elif any(k in lower_text for k in ["garbage", "dump", "trash", "waste", "smell", "dustbin", "litter"]):
        category = "Garbage"
        priority = "Medium"
    elif any(k in lower_text for k in ["streetlight", "dark", "pole", "wire", "spark", "light off", "bulb"]):
        category = "Streetlights"
        priority = "High" if "wire" in lower_text or "spark" in lower_text else "Medium"
    elif any(k in lower_text for k in ["drainage", "sewage", "gutter", "overflow", "manhole", "clogged drain"]):
        category = "Drainage"
        priority = "High" if "overflow" in lower_text or "manhole" in lower_text else "Medium"

    if any(k in lower_text for k in ["danger", "urgent", "emergency", "accident", "open manhole", "sparking", "death"]):
        priority = "Critical"

    return {
        "detected_language": detected_lang,
        "translated_text": translated,
        "category": category,
        "priority": priority,
        "recommended_department": DEPARTMENTS_MAP.get(category, "General Civic Grievance Cell"),
        "summary": translated[:120],
        "confidence_score": 0.86,
        "keywords": [category.lower(), priority.lower(), "civic-issue"]
    }


async def analyze_civic_complaint(text: str, user_category: Optional[str] = None) -> Dict[str, Any]:
    if not text or len(text.strip()) == 0:
        return {
            "detected_language": "English",
            "translated_text": "",
            "category": user_category or "Other",
            "priority": "Medium",
            "recommended_department": DEPARTMENTS_MAP.get(user_category or "Other", "General Civic Grievance Cell"),
            "confidence_score": 0.5,
            "keywords": []
        }

    prompt = f"""You are the CivicPulse AI Engine for Indian Municipal Grievance Management.
Analyze this citizen complaint (text may be in any Indian language or English):

"{text}"

Return ONLY valid JSON with this exact schema (no markdown, no code fences):
{{
  "detected_language": "English|Hindi|Bengali|Tamil|Telugu|Marathi|Kannada|Gujarati|Punjabi",
  "translated_text": "clear, actionable English translation (or original if English)",
  "category": "one of: Roads, Water Supply, Sanitation, Streetlights, Drainage, Garbage, Public Infrastructure, Other",
  "priority": "one of: Critical, High, Medium, Low",
  "recommended_department": "matching municipal department name",
  "summary": "1-sentence concise issue summary",
  "confidence_score": 0.92,
  "keywords": ["3-5 relevant tags"]
}}

Priority guidance: Critical = life-safety (electrocution, open manhole, contaminated water, gas leak). High = major disruption (large potholes, broken pipeline, no streetlight). Medium = quality-of-life. Low = minor cosmetic."""

    if EMERGENT_LLM_KEY:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"civicpulse-analysis-{uuid.uuid4().hex[:8]}",
                system_message="You are a specialized civic grievance AI that returns strict JSON only. Never include prose, markdown, or code fences."
            ).with_model("openai", "gpt-5.4-mini")

            response = await chat.send_message(UserMessage(text=prompt))
            content = (response or "").strip()

            # Clean up any accidental markdown fences
            if content.startswith("```"):
                content = content.split("```")[1] if "```" in content else content
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            parsed = json.loads(content)
            category = parsed.get("category", user_category or "Other")
            if category not in CATEGORIES:
                category = user_category or "Other"

            return {
                "detected_language": parsed.get("detected_language", "English"),
                "translated_text": parsed.get("translated_text", text),
                "category": category,
                "priority": parsed.get("priority", "Medium"),
                "recommended_department": parsed.get("recommended_department") or DEPARTMENTS_MAP.get(category, "General Civic Grievance Cell"),
                "summary": parsed.get("summary", text[:120]),
                "confidence_score": float(parsed.get("confidence_score", 0.92)),
                "keywords": parsed.get("keywords", [])
            }
        except Exception as e:
            logger.warning(f"Emergent LLM call failed, using rule-based fallback: {e}")

    return _rule_based_fallback(text, user_category)
