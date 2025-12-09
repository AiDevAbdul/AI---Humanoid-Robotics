from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ...models.chapter import Chapter


class ContentIndexer:
    @staticmethod
    def index_chapter_content(db: Session, chapter_id: str) -> bool:
        """
        Index a specific chapter's content for RAG system
        """
        # Get the chapter from database
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
        if not chapter:
            return False

        # Extract content from the chapter
        content = chapter.content.get('text', '')
        title = chapter.title
        chapter_slug = chapter.slug

        # In a real implementation, this would:
        # 1. Split the content into chunks
        # 2. Generate embeddings for each chunk
        # 3. Store in the vector database (Qdrant)
        # 4. Associate with chapter metadata

        # For now, just print what would happen
        print(f"Indexing chapter: {title} ({chapter_slug})")
        print(f"Content length: {len(content)} characters")

        # Mock indexing process
        content_chunks = ContentIndexer._chunk_content(content, 500)  # 500 chars per chunk
        print(f"Created {len(content_chunks)} chunks for indexing")

        # In a real implementation, each chunk would be embedded and stored in Qdrant
        # with metadata about the chapter
        return True

    @staticmethod
    def index_all_chapters(db: Session) -> Dict[str, Any]:
        """
        Index all chapters for RAG system
        """
        chapters = db.query(Chapter).filter(Chapter.is_published == True).all()
        results = {
            "indexed_count": 0,
            "failed_count": 0,
            "total_count": len(chapters),
            "failed_chapters": []
        }

        for chapter in chapters:
            try:
                success = ContentIndexer.index_chapter_content(db, str(chapter.id))
                if success:
                    results["indexed_count"] += 1
                else:
                    results["failed_count"] += 1
                    results["failed_chapters"].append(str(chapter.id))
            except Exception as e:
                results["failed_count"] += 1
                results["failed_chapters"].append(str(chapter.id))
                print(f"Failed to index chapter {chapter.id}: {str(e)}")

        return results

    @staticmethod
    def _chunk_content(content: str, chunk_size: int = 500) -> List[str]:
        """
        Split content into chunks of specified size
        """
        if not content:
            return []

        chunks = []
        start = 0

        while start < len(content):
            end = start + chunk_size

            # Try to break at sentence boundary if possible
            if end < len(content):
                # Look for a sentence boundary near the end
                sentence_end = content.rfind('. ', start + chunk_size // 2, start + chunk_size)
                if sentence_end != -1 and sentence_end > start:
                    end = sentence_end + 2  # Include the period and space

            chunk = content[start:end].strip()
            if chunk:  # Only add non-empty chunks
                chunks.append(chunk)
            start = end

        return chunks