import api from "../lib/axios";

/**
 * AI Service
 * Handles all AI-related API calls
 */
export const aiService = {
  /**
   * Check spelling and grammar
   * @param {string} text - Text to check
   * @returns {Promise<Object>} Spell check result
   */
  checkSpellGrammar: async (text) => {
    const res = await api.post("/ai/spell-check", { text });
    return res.data;
  },

  /**
   * Generate neutral summary
   * @param {string} text - Text to summarize
   * @param {number} maxWords - Maximum words in summary (default: 200)
   * @returns {Promise<Object>} Summary result
   */
  generateSummary: async (text, maxWords = 200) => {
    const res = await api.post("/ai/summary", { text, max_words: maxWords });
    return res.data;
  },

  /**
   * Calculate similarity between two texts
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {Promise<Object>} Similarity score
   */
  calculateSimilarity: async (text1, text2) => {
    const res = await api.post("/ai/similarity", { text1, text2 });
    return res.data;
  },

  /**
   * Extract keywords from text
   * @param {string} text - Text to extract keywords from
   * @returns {Promise<Object>} Keywords list
   */
  extractKeywords: async (text) => {
    const res = await api.post("/ai/keywords", { text });
    return res.data;
  },

  /**
   * Generate email template draft
   * @param {Object} payload - { template_type, context }
   * @returns {Promise<Object>} Generated template
   */
  generateEmailTemplate: async (payload) => {
    const res = await api.post("/ai/email-template", payload);
    return res.data;
  },

  /**
   * Get comprehensive author support (spell check, keywords, diff)
   */
  getAuthorSupport: async (text) => {
    const res = await api.post("/ai/author/support", { text });
    return res.data;
  },

  /**
   * Get review support (summary, key points)
   */
  getReviewSupport: async (text, maxWords = 300) => {
    const res = await api.post("/ai/review/support", { text, max_words: maxWords });
    return res.data;
  },
};

export default aiService;
