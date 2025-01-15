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
                    <button class="btn btn-primary btn-sm" onclick="showGameChart('${game._id}')">Ver Partida</button>
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
document.getElementById('add-game-form').addEventListener('submit', async function(event) {
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

// Inicializar el tablero de ajedrez
function initializeChessboard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = ''; // Limpiar el tablero

    const pieces = [
        { type: 'rook', color: 'black', position: 'a8' },
        { type: 'knight', color: 'black', position: 'b8' },
        { type: 'bishop', color: 'black', position: 'c8' },
        { type: 'queen', color: 'black', position: 'd8' },
        { type: 'king', color: 'black', position: 'e8' },
        { type: 'bishop', color: 'black', position: 'f8' },
        { type: 'knight', color: 'black', position: 'g8' },
        { type: 'rook', color: 'black', position: 'h8' },
        { type: 'pawn', color: 'black', position: 'a7' },
        { type: 'pawn', color: 'black', position: 'b7' },
        { type: 'pawn', color: 'black', position: 'c7' },
        { type: 'pawn', color: 'black', position: 'd7' },
        { type: 'pawn', color: 'black', position: 'e7' },
        { type: 'pawn', color: 'black', position: 'f7' },
        { type: 'pawn', color: 'black', position: 'g7' },
        { type: 'pawn', color: 'black', position: 'h7' },
        { type: 'rook', color: 'white', position: 'a1' },
        { type: 'knight', color: 'white', position: 'b1' },
        { type: 'bishop', color: 'white', position: 'c1' },
        { type: 'queen', color: 'white', position: 'd1' },
        { type: 'king', color: 'white', position: 'e1' },
        { type: 'bishop', color: 'white', position: 'f1' },
        { type: 'knight', color: 'white', position: 'g1' },
        { type: 'rook', color: 'white', position: 'h1' },
        { type: 'pawn', color: 'white', position: 'a2' },
        { type: 'pawn', color: 'white', position: 'b2' },
        { type: 'pawn', color: 'white', position: 'c2' },
        { type: 'pawn', color: 'white', position: 'd2' },
        { type: 'pawn', color: 'white', position: 'e2' },
        { type: 'pawn', color: 'white', position: 'f2' },
        { type: 'pawn', color: 'white', position: 'g2' },
        { type: 'pawn', color: 'white', position: 'h2' },
    ];

    // Crear las casillas del tablero
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = (row + col) % 2 === 0 ? 'white' : 'black';
            square.style.position = 'relative'; // Asegúrate de que las casillas tengan posición relativa
            square.style.width = '100%'; // Ajusta el ancho de las casillas
            square.style.height = '100%'; // Ajusta la altura de las casillas
            chessboard.appendChild(square);
        }
    }

    // Colocar las piezas en su posición inicial
    pieces.forEach(piece => {
        const pieceElement = document.createElement('div');
        pieceElement.className = `${piece.type} ${piece.color}`;
        pieceElement.style.position = 'absolute';
        pieceElement.style.width = '100%';
        pieceElement.style.height = '100%';
        pieceElement.style.backgroundImage = `url('images/${piece.color}_${piece.type}.png')`; // Asegúrate de tener las imágenes de las piezas
        pieceElement.style.backgroundSize = 'contain';
        pieceElement.style.backgroundRepeat = 'no-repeat';

        const position = piece.position;
        const col = position.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = 8 - parseInt(position[1]);

        // Ajustar la posición de las piezas
        const square = chessboard.children[row * 8 + col]; // Encuentra la casilla correspondiente
        square.appendChild(pieceElement); // Agregar la pieza a la casilla
    });
}

// Mostrar gráfico de la partida
async function showGameChart(gameId) {
    try {
        const response = await axios.get(`${apiUrl}/${gameId}`);
        const game = response.data;

        // Obtener el contexto del gráfico
        const ctx = document.getElementById('gameChart').getContext('2d');

        // Crear el gráfico
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: game.moves.map((_, index) => index + 1), // Números de movimiento
                datasets: [
                    {
                        label: 'Blancas',
                        data: game.moves.map((_, index) => index % 2 === 0 ? index + 1 : null),
                        borderColor: 'blue',
                        fill: false,
                    },
                    {
                        label: 'Negras',
                        data: game.moves.map((_, index) => index % 2 !== 0 ? index + 1 : null),
                        borderColor: 'red',
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Número de Movimiento'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Movimientos'
                        }
                    }
                }
            }
        });

        // Mostrar información de los jugadores
        const playersInfo = document.getElementById('players-info');
        playersInfo.innerHTML = `
            <p><strong>Jugadores:</strong> ${game.players.map(p => `${p.name} (${p.color})`).join(', ')}</p>
            <p><strong>Resultado:</strong> ${game.result}</p>
            <p><strong>Fecha</strong> ${new Date(game.date).toLocaleString()}</p>
        `;

        // Inicializar el índice de movimiento
        let currentMoveIndex = 0;

        // Función para actualizar el gráfico según el movimiento actual
        function updateChart() {
            chart.data.datasets[0].data = game.moves.map((_, index) => index % 2 === 0 ? index + 1 : null);
            chart.data.datasets[1].data = game.moves.map((_, index) => index % 2 !== 0 ? index + 1 : null);
            chart.update();
        }

        // Botones para avanzar y retroceder movimientos
        document.getElementById('prev-move').onclick = function() {
            if (currentMoveIndex > 0) {
                currentMoveIndex--;
                updateChart();
            }
        };

        document.getElementById('next-move').onclick = function() {
            if (currentMoveIndex < game.moves.length - 1) {
                currentMoveIndex++;
                updateChart();
            }
        };

    } catch (error) {
        console.error('Error al cargar el gráfico de la partida:', error);
        alert('Error al cargar el gráfico de la partida. Intenta de nuevo más tarde.');
    }
}

// Inicializar el tablero al cargar la página
window.onload = function() {
    fetchGames();
    initializeChessboard();
};