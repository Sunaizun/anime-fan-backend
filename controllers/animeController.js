const axios = require('axios');

exports.searchAnime = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const response = await axios.get(
      `https://api.jikan.moe/v4/anime?q=${q}`
    );

    res.json(response.data.data); 
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch anime data' });
  }
};
