document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('pokemonType');
    const generationSelect = document.getElementById('pokemonGeneration');

    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                typeSelect.appendChild(option);
            });
        });

    fetch('https://pokeapi.co/api/v2/generation')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(generation => {
                const option = document.createElement('option');
                option.value = generation.name;
                option.textContent = generation.name;
                generationSelect.appendChild(option);
            });
        });
});

document.getElementById('start-btn').addEventListener('click', async function() {
    document.body.style.backgroundColor = '#f8f9fc';
    const personalityTrait = document.getElementById('personalityTrait').value;
    if (!personalityTrait.trim()) {
        alert("Please enter a personality/role.");
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

    const type = document.getElementById('pokemonType').value;
    const generation = document.getElementById('pokemonGeneration').value;

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

        if (gameMode === 'description' || gameMode === 'both') {
            document.getElementById('pokemon-description').innerHTML = data.description;
        }

        if (gameMode === 'image' || gameMode === 'both') {
            document.getElementById('pokemon-image').src = data.imageUrl;
            document.getElementById('pokemon-image-section').classList.remove('hidden');
            document.getElementById('pokemon-description').innerHTML = '';
        }

        if (gameMode === 'description') {
            document.getElementById('hint-btn').classList.remove('hidden');
        } else {
            document.getElementById('hint-btn').classList.add('hidden');
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

document.getElementById('hint-btn').addEventListener('click', function() {
    const imageUrl = localStorage.getItem('pokemonImageUrl');
    showPokemonImage(imageUrl);
});


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
