const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3010;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ajedrez', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.log('Error de conexión a MongoDB', err);
});

// Definir el esquema para las partidas de ajedrez
const jugadorSchema = new mongoose.Schema({
  name: String,
  color: { type: String, enum: ['white', 'black'] },
  player_id: String
});

const partidaSchema = new mongoose.Schema({
  game_id: { type: String, required: true },
  players: [jugadorSchema],
  moves: [String],  // Lista de movimientos (por ejemplo, "e2e4", "e7e5")
  result: { type: String, enum: ['white_win', 'black_win', 'draw'] },
  date: { type: Date, default: Date.now }
});

const Partida = mongoose.model('Partida', partidaSchema);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// Ruta para obtener todas las partidas
app.get('/partidas', async (req, res) => {
  try {
    const partidas = await Partida.find();
    res.json(partidas);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/partidas', async (req, res) => {
  try {
      const partida = new Partida(req.body);
      await partida.save();
      res.status(201).send(partida);
  } catch (error) {
      console.error('Error al guardar la partida:', error);
      res.status(400).send({ error: error.message || 'Error al guardar la partida' });
  }
});


// Ruta para eliminar una partida por ID
app.delete('/partidas/:id', async (req, res) => {
  try {
    const partida = await Partida.findByIdAndDelete(req.params.id);
    if (partida) {
      res.json(partida);
    } else {
      res.status(404).send('Partida no encontrada');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Ruta para editar una partida por ID
app.get('/partidas/:id', async (req, res) => {
    try {
        const partida = await Partida.findById(req.params.id);
        if (!partida) {
            return res.status(404).send({ error: 'Partida no encontrada' });
        }
        res.send(partida);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
