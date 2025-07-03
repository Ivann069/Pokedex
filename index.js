import express from 'express';
import axios from 'axios';
import cors from 'cors'; // Add this line
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors()); // Enable CORS

const localPokemons = [];

app.get('/get-pokemon-type', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Missing Pokémon name' });
  }
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const types = response.data.types.map(t => t.type.name);
    res.json({ name, types });
  } catch (error) {
    res.status(404).json({ error: 'Pokémon not found' });
  }
});

app.get('/get-pokemon-image', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Missing Pokémon name' });
  }
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const image = response.data.sprites.front_default;
    res.json({ name, image });
  } catch (error) {
    res.status(404).json({ error: 'Pokémon not found' });
  }
});

app.post('/add-pokemon', (req, res) => {
  const { name, types, image } = req.body;
  if (!name || !types || !image) {
    return res.status(400).json({ error: 'Missing data' });
  }
  localPokemons.push({ name, types, image });
  res.json({ message: 'Pokémon added', pokemon: { name, types, image } });
});

app.get('/get-pokemon-info', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Missing Pokémon name' });
  }
  try {
    // Fetch main Pokémon data
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    const types = response.data.types.map(t => t.type.name);
    const image = response.data.sprites.front_default;
    const height = response.data.height;
    const weight = response.data.weight;

    // Fetch species data for habitat
    const speciesResponse = await axios.get(response.data.species.url);
    const habitat = speciesResponse.data.habitat ? speciesResponse.data.habitat.name : 'unknown';

    // Determine environment
    let environment = 'land';
    if (types.includes('water') || habitat === 'waters-edge' || habitat === 'sea') {
      environment = 'water';
    } else if (types.includes('flying')) {
      environment = 'air';
    }

    res.json({ name, image, types, habitat, environment, height, weight });
  } catch (error) {
    res.status(404).json({ error: 'Pokémon not found' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
