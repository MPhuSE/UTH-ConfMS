from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from google.genai import Client
from google.genai import types
import os
import json


class AIService(ABC):
    """Base class for AI services."""
    
    @abstractmethod
    def check_spell_grammar(self, text: str) -> Dict[str, Any]:
        """Check spelling and grammar."""
        pass
    
    @abstractmethod
    def generate_summary(self, text: str, max_words: int = 200) -> Dict[str, Any]:
        """Generate a neutral summary with key points."""
        pass
    
    @abstractmethod
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts."""
        pass
    
    @abstractmethod
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        pass

    @abstractmethod
    def get_author_support(self, text: str) -> Dict[str, Any]:
        """Provide comprehensive support for authors."""
        pass


class MockAIService(AIService):
    """Mock implementation of AI service for development."""
    
    def check_spell_grammar(self, text: str) -> Dict[str, Any]:
        return {"has_errors": False, "suggestions": [], "confidence": 0.95}
    
    def generate_summary(self, text: str, max_words: int = 200) -> Dict[str, Any]:
        return {"summary": "Mock summary...", "key_points": ["Point 1", "Point 2"]}
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        return 0.5
    
    def extract_keywords(self, text: str) -> List[str]:
        return ["mock", "keywords"]

    def get_author_support(self, text: str) -> Dict[str, Any]:
        return {
            "spell_check": self.check_spell_grammar(text),
            "keywords": self.extract_keywords(text),
            "suggestions": "Try to improve the abstract."
        }


class GeminiAIService(AIService):
    """Implementation using the new Google GenAI SDK."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if self.api_key:
            self.client = Client(api_key=self.api_key)
            self.model_id = 'gemini-flash-latest'
        else:
            self.client = None

    def _call_gemini(self, prompt: str) -> str:
        if not self.client:
            raise ValueError("Gemini API client not initialized. Check API Key.")
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            
            if not response or not response.text:
                return "{}"
                
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {str(e)}")
            raise e

    def check_spell_grammar(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Analyze the following text for spelling and grammar errors.
        1. Identify any errors (spelling, grammar, punctuation).
        2. Create a fully corrected version of the text.
        
        Return the result in JSON format:
        {{
            "has_errors": boolean,
            "corrected_text": "string (the full text with all corrections applied)",
            "errors_found": ["string (description of error 1)", "string (description of error 2)"],
            "confidence": float
        }}
        Text: {text}
        """
        try:
            res_text = self._call_gemini(prompt)
            # Find JSON block
            start = res_text.find('{')
            end = res_text.rfind('}') + 1
            data = json.loads(res_text[start:end])
            
            # Adapt to frontend expectations: 'suggestions' should be a list of valid replacement texts
            suggestions = []
            if data.get("has_errors") and data.get("corrected_text"):
                suggestions.append(data["corrected_text"])
            
            return {
                "has_errors": data.get("has_errors", False),
                "suggestions": suggestions,
                "confidence": data.get("confidence", 1.0)
            }
        except Exception as e:
            print(f"Spell Check Error: {str(e)}")
            return {"has_errors": False, "suggestions": [], "confidence": 0.0}

    def generate_summary(self, text: str, max_words: int = 200) -> Dict[str, Any]:
        prompt = f"""
        Provide a neutral academic summary of the following paper text. 
        Also extract 3-5 key points.
        Max words for summary: {max_words}.
        Return in JSON format:
        {{
            "summary": "string",
            "key_points": ["string", "string", ...]
        }}
        Text: {text}
        """
        try:
            res_text = self._call_gemini(prompt)
            start = res_text.find('{')
            end = res_text.rfind('}') + 1
            return json.loads(res_text[start:end])
        except:
            return {"summary": "Error generating summary", "key_points": []}

    def calculate_similarity(self, text1: str, text2: str) -> float:
        # Gemini doesn't have a direct similarity API in this way, 
        # but we can ask it to compare or use embeddings (not implemented here for simplicity)
        return 0.0

    def extract_keywords(self, text: str) -> List[str]:
        prompt = f"Extract 5-7 academic keywords from this text. Return only the keywords separated by commas: {text}"
        try:
            res_text = self._call_gemini(prompt)
            return [k.strip() for k in res_text.split(',')]
        except:
            return []

    def get_author_support(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        Act as an expert academic writing assistant. Analyze the following paper abstract/text:
        1. Check spelling and grammar (Vietnamese and English).
        2. Suggest relevant academic keywords.
        3. Provide a 'revised_version' that is more formal, professional, and clear.
        4. List specific academic improvements made.
        
        IMPORTANT: Your response must be in valid JSON format. Provide the revised text in the same language as the input.
        
        Return exactly this JSON structure:
        {{
            "spell_check": {{ "has_errors": boolean, "errors": ["description", ...] }},
            "keywords": ["keyword1", "keyword2", ...],
            "revised_version": "the complete improved text here",
            "improvements": ["improvement 1", "improvement 2", ...]
        }}
        
        Text to analyze:
        {text}
        """
        try:
            res_text = self._call_gemini(prompt)
            # Robust JSON extraction
            start = res_text.find('{')
            end = res_text.rfind('}') + 1
            if start != -1 and end != -1:
                return json.loads(res_text[start:end])
            raise ValueError("No JSON found in response")
        except Exception as e:
            print(f"Author Support Error: {str(e)}")
            return {
                "spell_check": {"has_errors": False, "errors": []},
                "keywords": [],
                "revised_version": text,  # Fallback to original text so it's not blank
                "improvements": ["Không thể kết nối với AI để tối ưu hóa tại thời điểm này."],
                "error": str(e)
            }


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
    
    def generate_summary(self, text: str, max_words: int = 200) -> Optional[Dict[str, Any]]:
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

    def get_author_support(self, text: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive author support."""
        return self.ai_service.get_author_support(text)
    
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

