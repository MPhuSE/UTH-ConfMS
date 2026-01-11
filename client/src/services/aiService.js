import api from "../lib/axios";

/**
 * AI Service
 * Handles AI-related API calls (spell check, summary, similarity, keywords)
 */
export const aiService = {
  /**
   * Check spelling and grammar
   * @param {Object} payload - { text }
   * @returns {Promise<Object>} Spell check response
   */
  spellCheck: async (payload) => {
    const res = await api.post("/ai/spell-check", payload);
    return res.data;
  },

  /**
   * Generate summary
   * @param {Object} payload - { text, max_words }
   * @returns {Promise<Object>} Summary response
   */
  generateSummary: async (payload) => {
    const res = await api.post("/ai/summary", payload);
    return res.data;
  },

  /**
   * Calculate similarity between two texts
   * @param {Object} payload - { text1, text2 }
   * @returns {Promise<Object>} Similarity response
   */
  calculateSimilarity: async (payload) => {
    const res = await api.post("/ai/similarity", payload);
    return res.data;
  },

  /**
   * Extract keywords from text
   * @param {Object} payload - { text }
   * @returns {Promise<Object>} Keywords response
   */
  extractKeywords: async (payload) => {
    const res = await api.post("/ai/keywords", payload);
    return res.data;
  },
};

export default aiService;