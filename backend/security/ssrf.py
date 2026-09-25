import socket
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Optional

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "169.254.169.254",
    "kubernetes.default.svc",
}

def is_safe_ip(ip_str: str) -> bool:
    """
    Validates if an IP address string is public and safe to connect to.
    Rejects private, loopback, link-local, multicast, and cloud metadata addresses.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            return False
        # Double check link-local cloud metadata IP range (169.254.0.0/16)
        if ip in ipaddress.ip_network("169.254.0.0/16"):
            return False
        return True
    except ValueError:
        return False

def validate_url_ssrf(url: str) -> Tuple[bool, Optional[str], str]:
    """
    Parses a URL, resolves its hostname via DNS, and checks if all resolved IPs are safe.
    Returns: (is_safe: bool, safe_ip: Optional[str], reason: str)
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False, None, "Invalid URL structure: hostname missing"
        
        hostname_lower = hostname.lower()
        if hostname_lower in BLOCKED_HOSTNAMES:
            return False, None, f"Host '{hostname}' is an internal/restricted endpoint (SSRF protection)"

        # Resolve hostname to IPv4/IPv6 addresses
        try:
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return False, None, f"Could not resolve hostname '{hostname}' via DNS"
        
        resolved_ips = set()
        for res in addr_info:
            ip_str = res[4][0]
            resolved_ips.add(ip_str)

        if not resolved_ips:
            return False, None, f"No IP addresses found for hostname '{hostname}'"

        for ip_str in resolved_ips:
            if not is_safe_ip(ip_str):
                return False, ip_str, f"Hostname '{hostname}' resolves to private/reserved IP '{ip_str}' (SSRF blocked)"

        # Pick primary resolved IP
        primary_ip = next(iter(resolved_ips))
        return True, primary_ip, "URL destination IP is valid and public"
        
    except Exception as e:
        return False, None, f"SSRF Validation Error: {str(e)}"
