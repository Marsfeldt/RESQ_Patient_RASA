from typing import Any, Dict, List, Optional, Text

from rasa.core.channels.socketio import SocketIOInput

class CustomSocketIOInput(SocketIOInput):
    def user_message_evt(
        self,
        sid: Text,
        data: Dict[Text, Any],
        url: Optional[Text] = None,
        metadata: Optional[Dict] = None,
    ) -> Optional[Dict[Text, Any]]:
        user_id = data.get("metadata", {}).get("user", sid)  # Use provided user ID or sid

        return {
            "text": data["message"],
            "parse_data": {"sender_id": user_id},
            "input_channel": self.name(),
            "message_id": data.get("message_id"),
            "metadata": metadata,
        }
