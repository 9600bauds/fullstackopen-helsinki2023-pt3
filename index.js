require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("build"));

var morgan = require("morgan");
morgan.token("posted-content", function getId(req) {
  if (req.method !== "POST") {
    return "";
  }
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :posted-content"
  )
);

const cors = require("cors");
app.use(cors());

const Person = require("./models/person");

const generateId = () => {
  //Why are we using the arrow notation here?
  return Math.floor(Math.random() * 2147483647);
};

let persons = []; //I don't even need this??

app.get("/", (request, response) => {
  response.send("How's this for self documenting?");
});

app.get("/info", (request, response) => {
  let responseHTML = ""; //Does JS have stringbuilders?
  responseHTML += "Phonebook has info for " + persons.length + " people.";
  responseHTML += "<br></br>";

  const currentDate = new Date();
  //const formattedDate = currentDate.toLocaleString(); //This is detailed enough
  const formattedDate = currentDate.toString(); //more detailed?
  responseHTML += formattedDate;

  response.send(responseHTML);
});

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => {
      console.log("Could not fetch persons!", error.message);
    });
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Person must have a name!",
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: "Person must have a phone number!",
    });
  }
  /*for (const person of persons) {
    if (person.name === body.name) {
      return response.status(400).json({
        error: "Person already exists in the phonebook!",
      });
    }
  }*/ //Forget about this for now.

  //ID is automatically generated
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  //persons = persons.concat(person); //I don't understand why this isn't needed.
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      console.log("Could not save new person!", error.message);
    });
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return response.status(404).end();
  }
  response.json(person);
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknown endpoint!" });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'ID could not be parsed!' })
  } 

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
