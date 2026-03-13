import uuid
import time
from typing import Dict, Any


class SessionStore:
    """
    In-memory session store for Play Mode games.

    Stores temporary game state between:
    - generation
    - evaluation

    NOTE:
    - This is NOT user auth
    - This is NOT persistent storage
    """

    def __init__(self, ttl_seconds: int = 1800):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl_seconds

    def create_session(self, data: Dict[str, Any]) -> str:
        session_id = str(uuid.uuid4())

        self.sessions[session_id] = {
            "data": data,
            "created_at": time.time()
        }

        return session_id

    def get_session(self, session_id: str) -> Dict[str, Any]:
        session = self.sessions.get(session_id)

        if not session:
            raise ValueError("Session not found or expired")

        if self._is_expired(session):
            del self.sessions[session_id]
            raise ValueError("Session expired")

        return session["data"]

    def delete_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def _is_expired(self, session: Dict[str, Any]) -> bool:
        return (time.time() - session["created_at"]) > self.ttl
