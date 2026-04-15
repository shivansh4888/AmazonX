const { getReorderSuggestions } = require('../services/reorderService');
const { getUserId } = require('../utils/requestContext');

const getSuggestions = async (req, res) => {
  try {
    const userId = getUserId(req);
    const suggestions = await getReorderSuggestions(userId);
    res.json(suggestions);
  } catch (error) {
    console.error('getSuggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch reorder suggestions' });
  }
};

module.exports = {
  getSuggestions,
};
