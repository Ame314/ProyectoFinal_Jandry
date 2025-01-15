async function showGameChart(gameId) {
    try {
        const response = await axios.get(`${apiUrl}/${gameId}`);
        console.log(response); // Verifica la respuesta de la API
        const game = response.data;

        // Verifica que los datos sean correctos
        if (!game.moves || !game.players || !game.result) {
            throw new Error('Datos de la partida incompletos');
        }

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
                        data: game.moves.map((_, index) => (index % 2 === 0 ? index + 1 : null)),
                        borderColor: 'blue',
                        fill: false,
                    },
                    {
                        label: 'Negras',
                        data: game.moves.map((_, index) => (index % 2 !== 0 ? index + 1 : null)),
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
            <p><strong>Fecha:</strong> ${new Date(game.date).toLocaleString()}</p>
        `;

        // Inicializar el índice de movimiento
        let currentMoveIndex = 0;

        // Función para actualizar el gráfico según el movimiento actual
        function updateChart() {
            const currentMoves = game.moves.slice(0, currentMoveIndex + 1);
            chart.data.datasets[0].data = currentMoves.map((_, index) => (index % 2 === 0 ? index + 1 : null));
            chart.data.datasets[1].data = currentMoves.map((_, index) => (index % 2 !== 0 ? index + 1 : null));
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

        // Inicializar el gráfico con el primer movimiento
        updateChart();

    } catch (error) {
        console.error('Error al cargar el gráfico de la partida:', error.response ? error.response.data : error.message);
        alert('Error al cargar el gráfico de la partida. Intenta de nuevo más tarde.');
    }
}