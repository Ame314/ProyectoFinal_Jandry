const apiUrl = 'http://localhost:3010/partidas';

// Cargar las partidas al cargar la página
async function fetchGames() {
    try {
        const response = await axios.get(apiUrl);
        const games = response.data;
        const gamesList = document.getElementById('games-list');

        gamesList.innerHTML = '';
        games.forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${game.game_id}</td>
                <td>${game.players.map(p => `${p.name}(${p.color})`).join(', ')}</td>
                <td>${game.moves.join(', ')}</td>
                <td>${game.result}</td>
                <td>${new Date(game.date).toLocaleString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteGame('${game._id}')">Eliminar</button>
                    <button class="btn btn-primary btn-sm" onclick="showGameInfo('${game._id}')">Ver Partida</button>
                </td>
            `;
            gamesList.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar las partidas:', error);
        alert('Error al cargar las partidas. Intenta de nuevo más tarde.');
    }
}

// Agregar una nueva partida
document.getElementById('add-game-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const game_id = document.getElementById('game_id').value;
    const players = document.getElementById('players').value.split(',').map(p => {
        const [name, color] = p.trim().split('(');
        return { name: name.trim(), color: color.replace(')', '').trim() };
    });
    const moves = document.getElementById('moves').value.split(',').map(m => m.trim());
    const result = document.getElementById('result').value;

    try {
        await axios.post(apiUrl, { game_id, players, moves, result });
        fetchGames();
        alert('Partida agregada correctamente');
        document.getElementById('add-game-form').reset();
    } catch (error) {
        console.error('Error al agregar la partida:', error);
        alert('Error al agregar la partida: ' + (error.response?.data?.error || 'Intenta de nuevo.'));
    }
});

// Eliminar una partida
async function deleteGame(id) {
    try {
        await axios.delete(`${apiUrl}/${id}`);
        fetchGames();
        alert('Partida eliminada correctamente');
    } catch (error) {
        console.error('Error al eliminar la partida:', error);
        alert('Error al eliminar la partida. Intenta de nuevo más tarde.');
    }
}

// Mostrar información de la partida y actualizar el tablero
async function showGameInfo(gameId) {
    try {
        const response = await axios.get(`${apiUrl}/${gameId}`);
        const game = response.data;

        // Mostrar información de la partida
        document.getElementById('info-game-id').textContent = game.game_id;
        document.getElementById('info-players').textContent = game.players
            .map(p => `${p.name} (${p.color})`)
            .join(', ');
        document.getElementById('info-result').textContent = game.result;

        // Formatear las jugadas y mostrarlas
        const movesContainer = document.getElementById('info-moves');
        movesContainer.innerHTML = game.moves.map((move, index) => {
            return `<div>${Math.floor(index / 2) + 1}${index % 2 === 0 ? '. ' : '... '}${move}</div>`;
        }).join('');

        // Inicializar el tablero y aplicar los movimientos
        initializeChessboard();
        applyMovesToChessboard(game.moves);
    } catch (error) {
        console.error('Error al cargar la información de la partida:', error);
        alert('Error al cargar la información de la partida. Intenta de nuevo más tarde.');
    }
}

// Inicializar el tablero con la posición inicial
function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = ''; // Limpiar el tablero

    // Crear las casillas
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.position = `${String.fromCharCode(97 + col)}${8 - row}`;
            chessboard.appendChild(square);
        }
    }

    // Colocar las piezas iniciales
    const initialPieces = {
        a8: '&#9820;', b8: '&#9822;', c8: '&#9821;', d8: '&#9819;',
        e8: '&#9818;', f8: '&#9821;', g8: '&#9822;', h8: '&#9820;',
        a7: '&#9823;', b7: '&#9823;', c7: '&#9823;', d7: '&#9823;',
        e7: '&#9823;', f7: '&#9823;', g7: '&#9823;', h7: '&#9823;',
        a2: '&#9817;', b2: '&#9817;', c2: '&#9817;', d2: '&#9817;',
        e2: '&#9817;', f2: '&#9817;', g2: '&#9817;', h2: '&#9817;',
        a1: '&#9814;', b1: '&#9816;', c1: '&#9815;', d1: '&#9813;',
        e1: '&#9812;', f1: '&#9815;', g1: '&#9816;', h1: '&#9814;',
    };

    for (const [position, piece] of Object.entries(initialPieces)) {
        const squareIndex =
            (8 - parseInt(position[1])) * 8 + (position.charCodeAt(0) - 'a'.charCodeAt(0));
        const square = chessboard.children[squareIndex];
        square.innerHTML = piece;
    }
}

// Aplicar movimientos al tablero
function applyMovesToChessboard(moves) {
    moves.forEach(move => {
        const from = move.substring(0, 2); // Casilla origen
        const to = move.substring(2, 4); // Casilla destino

        const fromSquare = document.querySelector(`[data-position="${from}"]`);
        const toSquare = document.querySelector(`[data-position="${to}"]`);

        if (fromSquare && toSquare && fromSquare.innerHTML) {
            toSquare.innerHTML = fromSquare.innerHTML; // Mover pieza
            fromSquare.innerHTML = ''; // Vaciar casilla origen
        }
    });
}

// Inicializar el tablero al cargar la página
window.onload = function () {
    fetchGames();
    initializeChessboard();
};
