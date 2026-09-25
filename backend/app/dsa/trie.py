"""Trie for autocomplete prefix matching (alternative to hash-map prefix scan)."""


class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search_prefix(self, prefix: str, limit: int = 10) -> list:
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        return self._collect(node, prefix, limit)

    def _collect(self, node, prefix, limit, results=None):
        if results is None:
            results = []
        if len(results) >= limit:
            return results
        if node.is_end:
            results.append(prefix)
        for char, child in sorted(node.children.items()):
            self._collect(child, prefix + char, limit, results)
        return results
