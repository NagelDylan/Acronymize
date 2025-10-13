"""
JWT authentication utilities for Clerk integration.
"""
import jwt
import requests
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError, InvalidSignatureError
from django.conf import settings
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

# Cache JWKS for 1 hour to avoid excessive requests
@lru_cache(maxsize=1)
def get_clerk_jwks():
    """
    Fetch and cache the JSON Web Key Set (JWKS) from Clerk.
    """
    if not settings.CLERK_DOMAIN:
        raise ValueError("CLERK_DOMAIN not configured in settings")

    jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"

    try:
        response = requests.get(jwks_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch JWKS from {jwks_url}: {e}")
        raise ValueError(f"Unable to fetch JWKS: {e}")

def get_signing_key(token):
    """
    Get the signing key for a JWT token from Clerk's JWKS.
    """
    try:
        # Get the key ID from the JWT header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')

        if not kid:
            raise ValueError("Token missing 'kid' claim in header")

        # Get JWKS and find matching key
        jwks = get_clerk_jwks()

        for key in jwks.get('keys', []):
            if key.get('kid') == kid:
                return jwt.algorithms.RSAAlgorithm.from_jwk(key)

        raise ValueError(f"No matching key found for kid: {kid}")

    except Exception as e:
        logger.error(f"Error getting signing key: {e}")
        raise ValueError(f"Invalid token key: {e}")

def verify_clerk_jwt(token):
    """
    Verify a Clerk JWT token and return the payload.

    Args:
        token (str): The JWT token to verify

    Returns:
        dict: The decoded JWT payload containing user information

    Raises:
        ValueError: If token is invalid, expired, or verification fails
    """
    if not token:
        raise ValueError("Token is required")

    if not settings.CLERK_DOMAIN:
        raise ValueError("Clerk configuration missing - CLERK_DOMAIN not set")

    try:
        # Get the signing key
        signing_key = get_signing_key(token)

        # Expected issuer based on Clerk domain
        expected_issuer = f"https://{settings.CLERK_DOMAIN}"

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=expected_issuer,
            # Clerk tokens should have these claims
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
            }
        )

        # Validate that we have the required claims
        if 'sub' not in payload:
            raise ValueError("Token missing required 'sub' claim")

        logger.debug(f"Successfully verified JWT for user: {payload.get('sub')}")
        return payload

    except ExpiredSignatureError:
        logger.warning("JWT token has expired")
        raise ValueError("Token has expired")

    except InvalidSignatureError:
        logger.warning("JWT token has invalid signature")
        raise ValueError("Invalid token signature")

    except InvalidTokenError as e:
        logger.warning(f"JWT token validation failed: {e}")
        raise ValueError(f"Invalid token: {e}")

    except Exception as e:
        logger.error(f"Unexpected error verifying JWT: {e}")
        raise ValueError(f"Token verification failed: {e}")

def extract_user_id_from_token(token):
    """
    Extract the Clerk user ID from a JWT token.

    Args:
        token (str): The JWT token

    Returns:
        str: The Clerk user ID (from 'sub' claim)

    Raises:
        ValueError: If token is invalid or user ID cannot be extracted
    """
    payload = verify_clerk_jwt(token)
    user_id = payload.get('sub')

    if not user_id:
        raise ValueError("User ID not found in token")

    return user_id