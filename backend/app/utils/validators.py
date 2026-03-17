import re


def validate_email(email):
    """Return True if email format is valid."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    """Password must be >= 8 chars, contain at least 1 uppercase and 1 digit."""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one digit'
    return True, None


def validate_required_fields(data, fields):
    """Check that all required fields are present and non-empty. Returns list of missing fields."""
    missing = [f for f in fields if not data.get(f)]
    return missing
