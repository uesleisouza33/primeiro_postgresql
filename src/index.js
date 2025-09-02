import express from "express";
import cors from "cors";
import { query } from "./db.js";
import { error } from "console";

const app = express();
app.use(cors());
app.use(express.json());

// verificar se está funcionando
app.get("/health", (req, res) => {
  res.send("Ok");
});

// fazer a listagem completa de todos os clientes
app.get("/clientes", async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, nome, telefone FROM clientes ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro encontrado", err);
  }
});

// fazer listagem de cliente por id
app.get("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      "SELECT id, nome, telefone FROM clientes WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Cliente não encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro encontrado", err);
  }
});

// Adicionar cliente
app.post("/clientes", async (req, res) => {
  try {
    const { nome, telefone } = req.body;
    if (!nome || !telefone) {
      return res
        .status(400)
        .json({ message: "Nome e/ou telefone são obrigatórios para cadastro" });
    }

    const { rows } = await query(
      "INSERT INTO clientes (nome, telefone) VALUES ($1, $2) RETURNING id, nome, telefone",
      [nome, String(telefone)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro encontrado", err);
  }
});

// Atualizar os clientes por ID
app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    if (!nome || !telefone) {
      return res
        .status(400)
        .json({ message: "Nome e/ou telefone são obrigatórios para cadastro" });
    }

    const { rows } = await query(
      "UPDATE clientes SET nome = $1, telefone = $2 WHERE id = $3 RETURNING id, nome, telefone",
      [nome, String(telefone), id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Cliente não encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro encontrado", err);
  }
});

//Deletar os clientes por ID
app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await query("DELETE FROM clientes WHERE id = $1", [
      id,
    ]);
    if (rowCount === 0) {
      return res.status(400).json({ message: "Cliente não encontrado" });
    }
    res.status(204).send()
  } catch (err) {
    console.error("Erro encontrado", err);
  }
});


// Handler(Gerenciamento) de erros
app.use((err, req, res, next) =>{
    console.error(err);
    res.status(500).json({message: "Erro interno"})
})

// Rodar o servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Servidor rodando sem problemas");
});
