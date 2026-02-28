from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import jwt
import os
import logging

logger = logging.getLogger(__name__)

# Routes that won't need auth
PUBLIC_ROUTES = {
    "/docs",
    "/openapi.json",
    "/redoc",
    "/auth/login",
    "/auth/register",
}

WS_PREFIX = "/ws/"


class JWTMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.secret_key = os.getenv("JWT_SECRET_KEY")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")

        if not self.secret_key:
            raise RuntimeError("JWT_SECRET_KEY not set")

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip auth for public routes
        if path in PUBLIC_ROUTES:
            return await call_next(request)

        # ws: token passed as ?token= query param
        if path.startswith(WS_PREFIX):
            token = request.query_params.get("token")
            if not token:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Missing Token"},
                )
            payload = self._decode_token(token)
            if payload is None:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid or expired Token"},
                )
            request.state.user = payload
            return await call_next(request)

        # Standard HTTP: token in Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing Authorization Header"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = auth_header.split(" ", 1)[1]
        payload = self._decode_token(token)
        if payload is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid or expired Token"},
                headers={"WWW-Authenticate": "Bearer"},
            )

        request.state.user = payload
        return await call_next(request)

    def _decode_token(self, token: str) -> dict | None:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
        except jwt.InvalidTokenError as e:
            logger.warning(f"JWT token is invalid: {e}")
        return None