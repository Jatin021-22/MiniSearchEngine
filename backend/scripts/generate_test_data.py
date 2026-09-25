"""Generate sample test documents for manual testing."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.benchmark_service import generate_test_documents


def main():
    docs = generate_test_documents(10)
    for doc in docs:
        print(f"Doc {doc['id']}: {list(doc['terms'].keys())[:5]}...")


if __name__ == "__main__":
    main()
