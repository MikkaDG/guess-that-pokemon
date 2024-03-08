import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Code om de HTML te tonen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client'))); // Toon HTML in live mode
// app.use(express.static(path.join(__dirname, '../client'))); // Toon HTML in development mode


const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

app.post('/chat', async (req, res) => {
    const { type, generation, personalityTrait, gameMode } = req.body;

    try {
        // Haalt de lijst van Pokémon op voor het opgegeven type
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await typeResponse.json();
        const pokemonOfType = typeData.pokemon.map(p => p.pokemon.name);

        // Haalt de lijst van Pokémon op voor de opgegeven generatie
        const generationResponse = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
        const generationData = await generationResponse.json();
        const pokemonOfGeneration = generationData.pokemon_species.map(p => p.name);

        // Filtert de lijst om alleen Pokémon te behouden die zowel aan het type als de generatie voldoen
        const filteredPokemon = pokemonOfType.filter(pokemon => pokemonOfGeneration.includes(pokemon));

        // Selecteert willekeurig een Pokémon uit de gefilterde lijst
        const randomPokemonName = filteredPokemon[Math.floor(Math.random() * filteredPokemon.length)];

        // Haalt informatie op over de geselecteerde Pokémon
        const pokemonDetailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonName}`);
        const pokemonDetails = await pokemonDetailsResponse.json();

        let description = ""; // Dit stelt de description in als een lege string als de spelmodus niet 'description' is

        // Genereert alleen beschrijving als spelmodus 'description' is om onnodig gebruik van de AI te voorkomen
        if (gameMode === 'description') {
            // Stelt de prompt in, vertelt de AI wat zijn persoonlijkheid is en vraagt om een beschrijving van de Pokémon
            const prompt = `You are a ${personalityTrait}. Make sure you really get into the role.
            Give a short description of ${pokemonDetails.name} without mentioning its name, make sure you mention it's colour, 
            type, if it resembles an animal mention that as well, and any other interesting details! 
            (For example: "It's a red and white Pokémon with a fire type, it looks like a lizard and it has a flame on its tail.") 
            Again, NEVER mention the name of the Pokémon in your response!`;

            // Verzendt de prompt naar het taalmodel als de spelmodus 'description' is
            const chatResponse = await model.invoke(prompt);
            description = chatResponse.content;
        }

        // Haalt de sprite op van de gekozen Pokémon, stelt de kans op een shiny sprite in op 1:10
        const imageUrl = Math.random() < 0.10 ? pokemonDetails.sprites.other['official-artwork'].front_shiny : pokemonDetails.sprites.other['official-artwork'].front_default;

        // Voegt de afbeelding toe aan de response die je terugstuurt naar de client
        res.json({ description: description, correctName: pokemonDetails.name, imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Could not process your chat request', details: error.message });
    }
});

// Stelt de poort in en start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
