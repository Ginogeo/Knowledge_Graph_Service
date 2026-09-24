from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    text: str
    page: int
    position: int


def chunk_pages(pages: list[dict[str, str | int]], size: int = 1000, overlap: int = 150) -> list[Chunk]:
    chunks: list[Chunk] = []
    for page in pages:
        text = str(page["text"])
        page_number = int(page["page"])
        start = 0
        while start < len(text):
            end = min(start + size, len(text))
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(Chunk(text=chunk, page=page_number, position=len(chunks)))
            if end == len(text):
                break
            start = max(end - overlap, start + 1)
    return chunks
