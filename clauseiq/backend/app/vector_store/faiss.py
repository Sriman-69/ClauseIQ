import faiss
import numpy as np
import pickle

class FAISSVectorStore:
    def __init__(self, index_path="faiss_index.bin", metadata_path="faiss_metadata.pkl"):
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.index = None
        self.metadata = []
        self.load()

    def add_embeddings(self, embeddings: np.ndarray, metadatas: list):
        if self.index is None:
            d = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(d)
        
        self.index.add(embeddings)
        self.metadata.extend(metadatas)
        self.save()

    def search(self, query_embedding: np.ndarray, k: int):
        if self.index is None:
            return []
            
        D, I = self.index.search(np.array([query_embedding]), k)
        results = []
        for i in range(k):
            if I[0][i] != -1:
                results.append({
                    "score": float(D[0][i]),
                    "metadata": self.metadata[I[0][i]]
                })
        return results

    def save(self):
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, "wb") as f:
            pickle.dump(self.metadata, f)

    def load(self):
        try:
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, "rb") as f:
                self.metadata = pickle.load(f)
        except (FileNotFoundError, RuntimeError):
            self.index = None
            self.metadata = []
