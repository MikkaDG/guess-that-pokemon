import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

app.post('/chat', async (req, res) => {
    const { type, generation } = req.body; // Verwacht dat de client zowel type als generatie stuurt

    try {
        // Haal de lijst van Pokémon op voor het opgegeven type
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await typeResponse.json();
        const pokemonOfType = typeData.pokemon.map(p => p.pokemon.name);

        // Haal de lijst van Pokémon op voor de opgegeven generatie
        const generationResponse = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
        const generationData = await generationResponse.json();
        const pokemonOfGeneration = generationData.pokemon_species.map(p => p.name);

        // Filter de lijst om alleen Pokémon te behouden die zowel aan het type als de generatie voldoen
        const filteredPokemon = pokemonOfType.filter(pokemon => pokemonOfGeneration.includes(pokemon));

        // Selecteer willekeurig een Pokémon uit de gefilterde lijst
        const randomPokemonName = filteredPokemon[Math.floor(Math.random() * filteredPokemon.length)];

        // Haal gedetailleerde informatie op over de geselecteerde Pokémon
        const pokemonDetailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomPokemonName}`);
        const pokemonDetails = await pokemonDetailsResponse.json();

        const prompt = `Give a short description of ${pokemonDetails.name} without mentioning its name, make sure 
        you mention it's colour, type, if it resembles an animal mention that as well, and any other interesting details! 
        (For example: "It's a red and white Pokémon with a fire type, it looks like a lizard and it has a flame on its tail." 
        Again, NEVER mention the name of the Pokémon in your response!`;

        // Verzend deze prompt naar het taalmodel
        const chatResponse = await model.invoke(prompt);

        // Gebruik het antwoord van het taalmodel als de beschrijving
        const description = chatResponse.content;

        // Binnen je /chat route, na het ophalen van pokemonDetails
        const imageUrl = pokemonDetails.sprites.other['official-artwork'].front_default;

        // Voeg de imageUrl toe aan de response die je terugstuurt naar de client
        res.json({ description: description, correctName: pokemonDetails.name, imageUrl: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Could not process your chat request', details: error.message });
    }
});


// Definieer de GET route op /chat voor het ontvangen van chat queries via URL parameters
app.get('/chat', async (req, res) => {
    try {
        const { query } = req.query; // Gebruik req.query voor GET-verzoeken

        // Als er geen query parameter aanwezig is, geef een standaardbericht terug
        if (!query) {
            return res.json({ message: 'Welkom bij de chatbot! Voeg een query parameter toe aan de URL om te beginnen. Bijvoorbeeld: /chat?query=jouwVraag' });
        }

        // Stuur de query naar het model en wacht op het antwoord
        const chatResponse = await model.invoke(query.toString());

        // Stuur het resultaat terug als JSON
        res.json({ response: chatResponse.content });
    } catch (error) {
        // Stuur een foutmelding terug als er iets misgaat
        res.status(500).json({ error: 'Could not process your chat request', details: error.message });
    }
});

// Stel de poort in en start de server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
