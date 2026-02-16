import axios from 'axios';

const getSongs = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.jamendo.com/v3.0/tracks/?client_id=0de80bee&format=jsonpretty&limit=200`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getPlaylistByTag = async (req, res) => {
  try {
    const tag = (req.params.tag || req.query.tag || "").trim();

    if (!tag) {
      return res.status(400).json({ message: "Missing tag parameter" });
    }

    const limit = parseInt(req.query.limit ?? "10", 10);

    const response = await axios.get(
      "https://api.jamendo.com/v3.0/tracks/",
      {
        params: {
          client_id: process.env.JAMENDO_CLIENT_ID, 
          tags: tag,
          limit,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "getPlaylistByTag error:",
      error?.response?.data ?? error.message
    );
    return res.status(500).json({ message: "Failed to fetch playlist" });
  }
};

const toggleFavourite = async (req, res) => {
  try {
    const user = req.user;
    const song = req.body.song;

    const exists = user.favourites.find((fav) => fav.id === song.id);

    if (exists) {
      user.favourites = user.favourites.filter(
        (fav) => fav.id !== song.id
      );
    } else {
      user.favourites.push(song);
    }

    await user.save();
    return res.status(200).json(user.favourites);
  } catch (error) {
    console.error(error.message);
    res
      .status(400)
      .json({ message: "Favourite not toggled, Something went wrong" });
  }
};

export { getSongs, getPlaylistByTag, toggleFavourite };
