import time
from fastapi import Request, HTTPException, status

class RateLimiter:
    def __init__(self, rate_limit: int, time_window: int):
        self.rate_limit = rate_limit
        self.time_window = time_window
        self.clients = {}

    def is_allowed(self, client_ip: str) -> bool:
        current_time = time.time()
        if client_ip not in self.clients:
            self.clients[client_ip] = []
        
        # Filter out timestamps outside window
        self.clients[client_ip] = [t for t in self.clients[client_ip] if current_time - t < self.time_window]
        
        if len(self.clients[client_ip]) < self.rate_limit:
            self.clients[client_ip].append(current_time)
            return True
        return False

# Global instance for sensitive endpoints
auth_limiter = RateLimiter(rate_limit=5, time_window=60)
