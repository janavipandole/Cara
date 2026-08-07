"""Minimal transactional mailer with a dev-mode console fallback.

Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / MAIL_FROM to
deliver real email. Without SMTP configuration the reset link is logged so the
flow can still be exercised in development and tests.
"""
import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

MAIL_FROM = os.environ.get("MAIL_FROM", "no-reply@cara.store")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_STARTTLS = os.environ.get("SMTP_STARTTLS", "true").lower() in ("1", "true", "yes")


def smtp_configured() -> bool:
    return bool(SMTP_HOST)


def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """Send a one-time password reset link to the user's email address."""
    reset_url = f"{FRONTEND_URL}/resetPassword.html?token={reset_token}"
    subject = "Reset your Cara password"
    body = (
        "You requested a password reset for your Cara account.\n\n"
        "Click the link below to choose a new password. The link is valid "
        f"for one hour and can only be used once.\n\n{reset_url}\n\n"
        "If you did not request this, you can safely ignore this email."
    )

    if smtp_configured():
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = MAIL_FROM
        msg["To"] = to_email
        msg.set_content(body)
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                if SMTP_STARTTLS:
                    server.starttls()
                if SMTP_USER:
                    server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        except Exception:
            logger.exception("Failed to send password reset email to %s", to_email)
        return

    # Dev mode: no SMTP configured, log the link so the flow can be verified.
    logger.warning(
        "SMTP not configured — password reset link for %s:\n%s",
        to_email,
        reset_url,
    )
