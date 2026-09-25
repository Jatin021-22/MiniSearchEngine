"""Skip List implementation for posting lists - O(log n) expected operations."""
import random
from typing import Any, List, Optional


class SkipListNode:
    def __init__(self, doc_id: int, level: int, data: Any = None):
        self.doc_id = doc_id
        self.data = data
        self.forward: List[Optional["SkipListNode"]] = [None] * (level + 1)


class SkipList:
    def __init__(self, max_level: int = 16, p: float = 0.5):
        self.max_level = max_level
        self.p = p
        self.header = SkipListNode(-1, max_level)
        self.level = 0

    def _random_level(self) -> int:
        lvl = 0
        while random.random() < self.p and lvl < self.max_level:
            lvl += 1
        return lvl

    def search(self, doc_id: int) -> bool:
        """O(log n) expected lookup."""
        current = self.header
        for i in range(self.level, -1, -1):
            while current.forward[i] and current.forward[i].doc_id < doc_id:
                current = current.forward[i]
        current = current.forward[0]
        return current is not None and current.doc_id == doc_id

    def get_node(self, doc_id: int) -> Optional[SkipListNode]:
        current = self.header
        for i in range(self.level, -1, -1):
            while current.forward[i] and current.forward[i].doc_id < doc_id:
                current = current.forward[i]
        current = current.forward[0]
        if current and current.doc_id == doc_id:
            return current
        return None

    def get_frequency(self, doc_id: int) -> int:
        node = self.get_node(doc_id)
        if node and node.data:
            return node.data.get("freq", 0)
        return 0

    def insert(self, doc_id: int, data: Any = None) -> None:
        """O(log n) expected insert or update."""
        update = [None] * (self.max_level + 1)
        current = self.header

        for i in range(self.level, -1, -1):
            while current.forward[i] and current.forward[i].doc_id < doc_id:
                current = current.forward[i]
            update[i] = current

        current = current.forward[0]
        if current and current.doc_id == doc_id:
            current.data = data
            return

        new_level = self._random_level()
        if new_level > self.level:
            for i in range(self.level + 1, new_level + 1):
                update[i] = self.header
            self.level = new_level

        new_node = SkipListNode(doc_id, new_level, data)
        for i in range(new_level + 1):
            new_node.forward[i] = update[i].forward[i]
            update[i].forward[i] = new_node

    def delete(self, doc_id: int) -> bool:
        """O(log n) expected delete."""
        update = [None] * (self.max_level + 1)
        current = self.header

        for i in range(self.level, -1, -1):
            while current.forward[i] and current.forward[i].doc_id < doc_id:
                current = current.forward[i]
            update[i] = current

        current = current.forward[0]
        if not current or current.doc_id != doc_id:
            return False

        for i in range(self.level + 1):
            if update[i].forward[i] != current:
                break
            update[i].forward[i] = current.forward[i]

        while self.level > 0 and self.header.forward[self.level] is None:
            self.level -= 1
        return True

    def range_query(self, start: int, end: int) -> List[int]:
        """O(log n + k) range query returning doc_ids in [start, end]."""
        result = []
        current = self.header
        for i in range(self.level, -1, -1):
            while current.forward[i] and current.forward[i].doc_id < start:
                current = current.forward[i]
        current = current.forward[0]
        while current and current.doc_id <= end:
            result.append(current.doc_id)
            current = current.forward[0]
        return result

    def get_all_doc_ids(self) -> List[int]:
        """Traverse level 0 to collect all doc_ids."""
        result = []
        current = self.header.forward[0]
        while current:
            result.append(current.doc_id)
            current = current.forward[0]
        return result

    def __len__(self) -> int:
        count = 0
        current = self.header.forward[0]
        while current:
            count += 1
            current = current.forward[0]
        return count
