import os
import random
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

ELEVEN_LABS_API_KEY = os.getenv("ELEVEN_LABS_API_KEY")
VOICE_ID = os.getenv("ELEVEN_LABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel

print(f"[FakeCall] API key loaded: {'YES' if ELEVEN_LABS_API_KEY else 'NO'}")

# Each conversation is a list of segments
# The frontend will request them one by one by index
# Pauses between segments simulate the user "responding"
CONVERSATIONS = [
    [
        "Hey! Oh good, you picked up. I was literally about to leave a voicemail.",
        "So I'm trying to figure out dinner tonight. Are you still coming? Because I haven't started cooking yet and I need to know.",
        "Okay perfect. Do you want me to make that pasta thing or should we just order? I'm honestly fine either way.",
        "Okay yeah let's just order then. I'll look up the Thai place. They were so good last time.",
        "Alright cool. Text me when you're close and I'll put the order in so it gets there around the same time you do.",
        "Okay perfect. See you soon, drive safe. Bye!",
    ],
    [
        "Hey, it's me. Are you busy right now? I have to tell you something.",
        "Okay so you know how I've been looking for a new apartment? I think I finally found one. It's actually really nice.",
        "It's in that area near the park we always go to. Two bedrooms, hardwood floors, the whole thing. And the price is actually not insane.",
        "I know right? I couldn't believe it either. I'm going to see it tomorrow. Do you want to come with me? I could really use a second opinion.",
        "Perfect. I'll send you the address. It's at like two in the afternoon, does that work?",
        "Amazing. Okay I'll let you go, I just had to tell someone. See you tomorrow!",
    ],
    [
        "Hey! Sorry I missed your call earlier, I was in a meeting that would not end.",
        "What did you need? Everything okay?",
        "Oh yeah I saw that too. Honestly I can't believe it. Did you talk to anyone else about it yet?",
        "Yeah that's what I figured. Listen I think we just have to let it go for now and see what happens. There's not much we can do about it tonight.",
        "You're right, you're totally right. Okay I'm going to head out soon, do you need anything before I leave?",
        "Okay perfect. I'll check in with you later. Talk soon, bye!",
    ],
]


@router.post("/fake-call/audio")
async def get_fake_call_audio(segment: int = Query(0), conversation: int = Query(-1)):
    if not ELEVEN_LABS_API_KEY:
        raise HTTPException(status_code=500, detail="11Labs API key not configured")

    # Pick a random conversation on first segment, reuse same one after
    conv_index = conversation if conversation >= 0 else random.randint(0, len(CONVERSATIONS) - 1)
    conv = CONVERSATIONS[conv_index]

    if segment >= len(conv):
        # Signal to frontend that the conversation is over
        raise HTTPException(status_code=404, detail="No more segments")

    script = conv[segment]

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
            headers={
                "xi-api-key": ELEVEN_LABS_API_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": script,
                "model_id": "eleven_turbo_v2",
                "voice_settings": {
                    "stability": 0.4,
                    "similarity_boost": 0.8,
                    "style": 0.3,
                    "use_speaker_boost": True,
                },
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"11Labs error: {response.text}"
        )

    # Return audio + metadata headers so frontend knows conversation index and total segments
    return StreamingResponse(
        iter([response.content]),
        media_type="audio/mpeg",
        headers={
            "X-Conversation-Index": str(conv_index),
            "X-Total-Segments": str(len(conv)),
            "X-Current-Segment": str(segment),
        }
    )