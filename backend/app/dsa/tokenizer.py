"""Text tokenization with stopword removal and frequency counting."""
import re
from typing import Dict


class Tokenizer:
    STOPWORDS = {"the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "to", "of"}

    @staticmethod
    def tokenize(text: str) -> Dict[str, int]:
        """Lowercase, split, remove stopwords, return term frequencies."""
        tokens = re.findall(r"\b\w+\b", text.lower())
        freq: Dict[str, int] = {}
        for token in tokens:
            if token not in Tokenizer.STOPWORDS and len(token) > 1:
                freq[token] = freq.get(token, 0) + 1
        return freq

    @staticmethod
    def tokenize_query(query: str) -> list:
        """Tokenize search query into term list."""
        tokens = re.findall(r"\b\w+\b", query.lower())
        return [t for t in tokens if t not in Tokenizer.STOPWORDS and len(t) > 1]
