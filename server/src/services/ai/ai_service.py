from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod


class AIService(ABC):
    """Base class for AI services."""
    
    @abstractmethod
    def check_spell_grammar(self, text: str) -> Dict[str, Any]:
        """Check spelling and grammar."""
        pass
    
    @abstractmethod
    def generate_summary(self, text: str, max_words: int = 200) -> str:
        """Generate a neutral summary."""
        pass
    
    @abstractmethod
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts."""
        pass
    
    @abstractmethod
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        pass


class MockAIService(AIService):
    """Mock implementation of AI service for development."""
    
    def check_spell_grammar(self, text: str) -> Dict[str, Any]:
        """Mock spell and grammar check."""
        return {
            "has_errors": False,
            "suggestions": [],
            "confidence": 0.95
        }
    
    def generate_summary(self, text: str, max_words: int = 200) -> str:
        """Mock summary generation."""
        words = text.split()[:max_words]
        return " ".join(words) + "..."
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Mock similarity calculation."""
        # Simple word overlap
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union) if union else 0.0
    
    def extract_keywords(self, text: str) -> List[str]:
        """Mock keyword extraction."""
        # Simple: return first few words as keywords
        words = text.lower().split()
        return words[:5]


class AIServiceManager:
    """Manager for AI services with feature flags."""
    
    def __init__(self, ai_service: AIService, enabled_features: Dict[str, bool] = None):
        self.ai_service = ai_service
        self.enabled_features = enabled_features or {
            "spell_check": True,
            "summary": True,
            "similarity": True,
            "keywords": True
        }
    
    def check_spell_grammar(self, text: str) -> Optional[Dict[str, Any]]:
        """Check spelling and grammar if enabled."""
        if not self.enabled_features.get("spell_check", False):
            return None
        return self.ai_service.check_spell_grammar(text)
    
    def generate_summary(self, text: str, max_words: int = 200) -> Optional[str]:
        """Generate summary if enabled."""
        if not self.enabled_features.get("summary", False):
            return None
        return self.ai_service.generate_summary(text, max_words)
    
    def calculate_similarity(self, text1: str, text2: str) -> Optional[float]:
        """Calculate similarity if enabled."""
        if not self.enabled_features.get("similarity", False):
            return None
        return self.ai_service.calculate_similarity(text1, text2)
    
    def extract_keywords(self, text: str) -> Optional[List[str]]:
        """Extract keywords if enabled."""
        if not self.enabled_features.get("keywords", False):
            return None
        return self.ai_service.extract_keywords(text)
    
    def suggest_reviewer_assignments(
        self,
        submission_abstract: str,
        reviewer_keywords: Dict[int, List[str]]
    ) -> List[Dict[str, Any]]:
        """Suggest reviewer assignments based on similarity."""
        if not self.enabled_features.get("similarity", False):
            return []
        
        suggestions = []
        submission_keywords = self.extract_keywords(submission_abstract) or []
        
        for reviewer_id, keywords in reviewer_keywords.items():
            reviewer_text = " ".join(keywords)
            similarity = self.calculate_similarity(submission_abstract, reviewer_text)
            
            suggestions.append({
                "reviewer_id": reviewer_id,
                "similarity_score": similarity,
                "matching_keywords": list(set(submission_keywords) & set(keywords))
            })
        
        # Sort by similarity score
        suggestions.sort(key=lambda x: x["similarity_score"], reverse=True)
        return suggestions

