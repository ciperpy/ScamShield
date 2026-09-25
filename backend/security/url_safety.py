from urllib.parse import urlparse, urlunparse

def normalize_url(url: str) -> str:
    """
    Normalizes a user-supplied URL by adding default http scheme if missing,
    lowercasing hostname, and removing trailing whitespace.
    """
    url = url.strip()
    if not url:
        return ""
    
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    try:
        parsed = urlparse(url)
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()
        
        # Reconstruct normalized URL
        normalized = urlunparse((
            scheme,
            netloc,
            parsed.path or "/",
            parsed.params,
            parsed.query,
            parsed.fragment
        ))
        return normalized
    except Exception:
        url

def sanitize_for_json(obj):
    """
    Recursively converts Pydantic models, Enums, and complex objects into JSON-serializable primitives.
    """
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sanitize_for_json(i) for i in obj]
    if hasattr(obj, "value"):  # Enum
        return obj.value
    return obj
