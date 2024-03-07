let allTypes
document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('pokemonType'); // Selectielijst voor types
    const generationSelect = document.getElementById('pokemonGeneration'); // Selectielijst voor generaties
    allTypes = []; // Array om alle types in op te slaan
    const excludedTypes = ['unknown', 'shadow']; // Types die niet in de lijst moeten komen

    // Haal alle types op van de PokéAPI
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            // Filter de types om de uitgesloten types te verwijderen
            allTypes = data.results.filter(type => !excludedTypes.includes(type.name));

            // Voeg een optie toe voor 'Any'
            const anyOption = document.createElement('option');
            anyOption.value = 'any';
            anyOption.textContent = 'Any';
            typeSelect.appendChild(anyOption);

            // Voeg de overige types toe aan de optielijst
            allTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1); // Capitalize first letter
                typeSelect.appendChild(option);
            });
        });

    // Haal alle generaties op van de PokéAPI
    fetch('https://pokeapi.co/api/v2/generation')
        .then(response => response.json())
        .then(data => {
            // Voeg de generaties toe aan de selectielijst
            data.results.forEach(generation => {
                // Maak een optie voor elke generatie
                const option = document.createElement('option');
                option.value = generation.name;
                option.textContent = generation.name.charAt(0).toUpperCase() + generation.name.slice(1);
                generationSelect.appendChild(option);
            });
        });
});

document.getElementById('start-btn').addEventListener('click', async function() {
    const personalityTrait = document.getElementById('personalityTrait').value; // Haal de persoonlijkheid op
    // Controleer of er een persoonlijkheid is ingevuld
    if (!personalityTrait.trim()) {
        alert("Please enter a personality.");
        return;
    }

    // Zet de startknop op 'Loading' en zorg dat deze niet meer clickable is
    const startButton = this;
    startButton.disabled = true;
    startButton.textContent = 'Loading...';

    // Haal de spelmodus op
    const gameMode = document.getElementById('gameMode').value;

    document.body.style.backgroundColor = '#f8f9fc'; // Reset de achtergrondkleur
    document.getElementById('pokemon-image').src = ''; // Reset de afbeelding
    document.getElementById('user-guess').value = ''; // Reset het gokveld
    document.getElementById('pokemon-description').innerHTML = 'Loading...'; // Zet de beschrijving op 'Loading...'
    document.getElementById('pokemon-image-section').classList.add('hidden'); // Verberg de afbeelding
    document.getElementById('pokemon-description').classList.remove('hidden'); // Laat de beschrijving zien

    // Haal de waarden op van de selectielijsten
    let type = document.getElementById('pokemonType').value;
    const generation = document.getElementById('pokemonGeneration').value;

    // Als 'Any' is geselecteerd, kies dan een willekeurig type
    if (type === 'any') {
        // Ensure this logic only runs if 'any' is selected
        const randomIndex = Math.floor(Math.random() * allTypes.length);
        type = allTypes[randomIndex].name;
    }

    // Verzend een POST-verzoek naar de server met de geselecteerde waarden
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, generation, personalityTrait }),
        });
        const data = await response.json();

        // Sla de afbeelding op in localStorage
        localStorage.setItem('pokemonImageUrl', data.imageUrl);

        // Voeg de beschrijving toe aan de pagina als de spelmodus 'description' is
        if (gameMode === 'description') {
            document.getElementById('pokemon-description').innerHTML = data.description;
        }

        // Voeg de afbeelding toe aan de pagina als de spelmodus 'image' is
        if (gameMode === 'image') {
            document.getElementById('pokemon-image').src = data.imageUrl;
            document.getElementById('pokemon-image-section').classList.remove('hidden');
            document.getElementById('pokemon-description').innerHTML = '';
        }

        // Zet de correcte naam van de Pokémon in localStorage
        localStorage.setItem('correctPokemonName', data.correctName);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('pokemon-description').innerHTML = 'Failed to get response';
    } finally {
        // Zet de startknop weer aan
        startButton.disabled = false;
        startButton.textContent = 'Start Game';
    }
});

// Functie die de afbeelding van de Pokémon laat zien
function showPokemonImage(imageUrl) {
    document.getElementById('pokemon-image').src = imageUrl;
    document.getElementById('pokemon-image-section').classList.remove('hidden');
}

document.getElementById('guess-btn').addEventListener('click', function() {
    const userGuess = document.getElementById('user-guess').value.toLowerCase();
    const correctName = localStorage.getItem('correctPokemonName').toLowerCase();

    // Controleer of de gok overeenkomt met de correcte naam
    if(userGuess === correctName) {
        document.body.style.backgroundColor = '#d1e7dd'; // Lichtgroen voor correct antwoord
        // Laat de afbeelding van de Pokémon zien als het antwoord correct is
        const imageUrl = localStorage.getItem('pokemonImageUrl');
        showPokemonImage(imageUrl);
    } else {
        document.body.style.backgroundColor = '#f8d7da'; // Lichtrood voor fout antwoord
    }
});
