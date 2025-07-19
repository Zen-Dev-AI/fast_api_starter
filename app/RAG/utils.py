"""
RAG Utilities
Helper functions for text processing and validation
"""

import re
from typing import Optional


def validate_file_type(filename: Optional[str], allowed_extensions: list[str]) -> bool:
    """
    Validate if a file has an allowed extension.
    
    Args:
        filename: The filename to validate
        allowed_extensions: List of allowed file extensions (e.g., ['.txt', '.md'])
        
    Returns:
        True if file has allowed extension, False otherwise
    """
    if not filename:
        return False
    
    return any(filename.lower().endswith(ext.lower()) for ext in allowed_extensions)


def clean_text(text: str) -> str:
    """
    Clean text by removing extra whitespace and normalizing line breaks.
    
    Args:
        text: Raw text to clean
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace and normalize line breaks
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text


def estimate_tokens(text: str, words_per_token: float = 0.75) -> int:
    """
    Estimate the number of tokens in a text.
    
    Args:
        text: Input text
        words_per_token: Average words per token ratio
        
    Returns:
        Estimated token count
    """
    word_count = len(text.split())
    return int(word_count / words_per_token)


def truncate_text(text: str, max_length: int = 1000) -> str:
    """
    Truncate text to a maximum length while preserving word boundaries.
    
    Args:
        text: Text to truncate
        max_length: Maximum character length
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    # Find the last space before max_length
    truncated = text[:max_length]
    last_space = truncated.rfind(' ')
    
    if last_space > 0:
        return truncated[:last_space] + "..."
    else:
        return truncated + "..."
