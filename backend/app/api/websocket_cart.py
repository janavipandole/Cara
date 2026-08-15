from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps session_id -> list of WebSocket connections
        self.active_sessions: Dict[str, List[WebSocket]] = {}
        # Maps session_id -> list of active user dicts [{user_id, name, color}]
        self.session_users: Dict[str, List[dict]] = {}

    async def connect(self, session_id: str, websocket: WebSocket, user_info: dict):
        await websocket.accept()
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = []
            self.session_users[session_id] = []

        self.active_sessions[session_id].append(websocket)
        self.session_users[session_id].append(user_info)

        # Notify room of user join and state update.
        # The coroutine's return value is unused, so await it directly rather
        # than assigning it to a local variable (the previous
        # `await this_broadcast = self.broadcast(...)` was invalid syntax that
        # prevented the whole FastAPI app from importing — see issue #7780).
        await self.broadcast(session_id, {
            "type": "USER_JOINED",
            "user": user_info,
            "active_users": self.session_users[session_id],
        })

    def disconnect(self, session_id: str, websocket: WebSocket, user_info: dict):
        if session_id in self.active_sessions:
            if websocket in self.active_sessions[session_id]:
                self.active_sessions[session_id].remove(websocket)
            
            # Remove user info
            self.session_users[session_id] = [
                u for u in self.session_users.get(session_id, []) if u.get("user_id") != user_info.get("user_id")
            ]

            if not self.active_sessions[session_id]:
                del self.active_sessions[session_id]
                del self.session_users[session_id]

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_sessions:
            dead_sockets = []
            for connection in self.active_sessions[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)
            
            for dead in dead_sockets:
                if dead in self.active_sessions[session_id]:
                    self.active_sessions[session_id].remove(dead)

manager = ConnectionManager()

@router.websocket("/ws/cart/{session_id}")
async def shared_cart_websocket(websocket: WebSocket, session_id: str):
    user_id = websocket.query_params.get("user_id", "anon_" + session_id[:4])
    user_name = websocket.query_params.get("user_name", "Shopper " + user_id[-3:])
    user_color = websocket.query_params.get("user_color", "#088178")

    user_info = {"user_id": user_id, "name": user_name, "color": user_color}
    await manager.connect(session_id, websocket, user_info)

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg["sender"] = user_info
                # Broadcast real-time item updates, split payments, or presence
                await manager.broadcast(session_id, msg)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket, user_info)
        await manager.broadcast(session_id, {
            "type": "USER_LEFT",
            "user": user_info,
            "active_users": manager.session_users.get(session_id, [])
        })
