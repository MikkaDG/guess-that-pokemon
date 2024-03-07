let allTypes
document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('pokemonType');
    const generationSelect = document.getElementById('pokemonGeneration');
    let allTypes = []; // Store all types for later use
    const excludedTypes = ['unknown', 'shadow']; // Types to be excluded

    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            allTypes = data.results.filter(type => !excludedTypes.includes(type.name)); // Exclude certain types
            allTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1); // Capitalize first letter
                typeSelect.appendChild(option);
            });
        });

    fetch('https://pokeapi.co/api/v2/generation')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(generation => {
                const option = document.createElement('option');
                option.value = generation.name;
                option.textContent = generation.name.charAt(0).toUpperCase() + generation.name.slice(1);
                generationSelect.appendChild(option);
            });
        });
});

document.getElementById('start-btn').addEventListener('click', async function() {
    document.body.style.backgroundColor = '#f8f9fc';
    const personalityTrait = document.getElementById('personalityTrait').value;
    if (!personalityTrait.trim()) {
        alert("Please enter a personality.");
        return;
    }

    const startButton = this;
    startButton.disabled = true;
    startButton.textContent = 'Loading...';
    document.getElementById('pokemon-image').src = '';
    const gameMode = document.getElementById('gameMode').value;
    document.getElementById('user-guess').value = '';
    document.getElementById('pokemon-description').innerHTML = 'Loading...';
    document.getElementById('pokemon-image-section').classList.add('hidden');
    document.getElementById('pokemon-description').classList.remove('hidden');

    let type = document.getElementById('pokemonType').value;
    const generation = document.getElementById('pokemonGeneration').value;

    // Handling the "Any" option
    if (type === 'any') {
        const randomIndex = Math.floor(Math.random() * allTypes.length); // Randomly select an index
        type = allTypes[randomIndex].name; // Update type to a randomly selected one
    }

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, generation, personalityTrait }),
        });
        const data = await response.json();

        localStorage.setItem('pokemonImageUrl', data.imageUrl);

        if (gameMode === 'description') {
            document.getElementById('pokemon-description').innerHTML = data.description;
        }

        if (gameMode === 'image') {
            document.getElementById('pokemon-image').src = data.imageUrl;
            document.getElementById('pokemon-image-section').classList.remove('hidden');
            document.getElementById('pokemon-description').innerHTML = '';
        }

        localStorage.setItem('correctPokemonName', data.correctName);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('pokemon-description').innerHTML = 'Failed to get response';
    } finally {
        startButton.disabled = false;
        startButton.textContent = 'Start Game';
    }
});


function showPokemonImage(imageUrl) {
    document.getElementById('pokemon-image').src = imageUrl;
    document.getElementById('pokemon-image-section').classList.remove('hidden');
}

document.getElementById('guess-btn').addEventListener('click', function() {
    const userGuess = document.getElementById('user-guess').value.toLowerCase();
    const correctName = localStorage.getItem('correctPokemonName').toLowerCase();

    if(userGuess === correctName) {
        document.body.style.backgroundColor = '#d1e7dd'; // Lichtgroen voor correct antwoord
        const imageUrl = localStorage.getItem('pokemonImageUrl');
        showPokemonImage(imageUrl);
    } else {
        document.body.style.backgroundColor = '#f8d7da'; // Lichtrood voor fout antwoord
    }
});
