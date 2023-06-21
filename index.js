const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("build"));

app.use(
  morgan(function (tokens, req, res) {
    if (req.method === "POST") {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens["response-time"](req, res),
        JSON.stringify(req.body),
      ].join(" ");
    }
    return null;
  })
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
  {
    name: "Ma1y Popp2dieck",
    number: "39-23-6423122",
    id: 5,
  },
];
//homepage
app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});
//info page
app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p> ${new Date()}`
  );
});

//get all
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

//get single person
app.get("/api/persons/:id?", (req, res) => {
  const person = persons.find((person) => person.id === Number(req.params.id));
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

//delete a person
app.delete("/api/persons/:id?", (req, res) => {
  persons = persons.filter((person) => person.id !== Number(req.params.id));
  res.status(204).end();
});

//add a person
app.post("/api/persons", (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: "name missing" });
  }
  if (!req.body.number) {
    return res.status(400).json({ error: "number missing" });
  }
  if (persons.find((person) => person.name === req.body.name)) {
    return res.status(400).json({ error: "person already exists" });
  }

  let person = req.body;
  person.id = Math.floor(Math.random() * 100000);

  console.log(person);

  persons = persons.concat(person);

  console.log(persons);

  res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
