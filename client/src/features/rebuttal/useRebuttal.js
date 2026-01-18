import axios from "../../lib/axios";

/**
 * Get rebuttal content by paperId
 * @param {string|number} paperId
 */
export async function getRebuttalByPaper(paperId) {
  const res = await axios.get(`/rebuttals/${paperId}`);
  return res.data;
}

/**
 * Submit rebuttal for a paper
 * @param {{ paperId: string|number, content: string }} data
 */
export async function submitRebuttal(data) {
  const res = await axios.post("/rebuttals", {
    submission_id: Number(data.paperId),
    content: data.content,
  });
  return res.data;
}
