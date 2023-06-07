const express = require("express");
const app = express();
app.use(express.json());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("How's this for self documenting?");
});

app.get("/info", (request, response) => {
  let responseHTML = ""; //Does JS have stringbuilders?
  responseHTML += "Phonebook has info for " + persons.length + " people.";
  responseHTML += "<br></br>"

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString(); //This is detailed enough
  responseHTML += formattedDate

  response.send(responseHTML);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id); //I hate this way of removing from an array.

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
