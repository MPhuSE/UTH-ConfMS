import axios from "../../lib/axios";

/**
 * Get rebuttal content by paperId
 * @param {string|number} paperId
 */
export async function getRebuttalByPaper(paperId) {
  const res = await axios.get(`/api/rebuttals/${paperId}`);
  return res.data;
}

/**
 * Submit rebuttal for a paper
 * @param {{ paperId: string|number, content: string }} data
 */
export async function submitRebuttal(data) {
  const res = await axios.post("/api/rebuttals", data);
  return res.data;
}
