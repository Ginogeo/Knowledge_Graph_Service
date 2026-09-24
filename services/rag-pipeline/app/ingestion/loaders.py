from pathlib import Path

from bs4 import BeautifulSoup
from docx import Document
from pypdf import PdfReader


def load_text(filename: str, content: bytes) -> list[dict[str, str | int]]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        reader = PdfReader(__import__("io").BytesIO(content))
        return [{"text": page.extract_text() or "", "page": index + 1} for index, page in enumerate(reader.pages)]
    if suffix == ".doc":
        raise ValueError("Legacy .doc files are not supported; convert the file to .docx first.")
    if suffix == ".docx":
        document = Document(__import__("io").BytesIO(content))
        return [{"text": "\n".join(paragraph.text for paragraph in document.paragraphs), "page": 1}]
    if suffix == ".html":
        return [{"text": BeautifulSoup(content, "html.parser").get_text("\n", strip=True), "page": 1}]
    if suffix == ".txt":
        return [{"text": content.decode("utf-8"), "page": 1}]
    raise ValueError("Unsupported file type. Use PDF, DOC, DOCX, TXT, or HTML.")
