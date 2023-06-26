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

app.get("/", (request, response) => {
  response.send("How's this for self documenting?");
});

app.get("/info", (request, response) => {
  let responseHTML = ""; //Does JS have stringbuilders?
  Person.find({}).then((result) => {
    responseHTML += "Phonebook has info for " + result.length + " people.";
    responseHTML += "<br></br>";

    const currentDate = new Date();
    //const formattedDate = currentDate.toLocaleString(); //This is detailed enough
    const formattedDate = currentDate.toString(); //more detailed?
    responseHTML += formattedDate;

    response.send(responseHTML);
  });
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => {
      console.log("Could not fetch persons!", error.message);
      next(error);
    });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body; //Needs sanitization

  const personPojo = {
    name: body.name,
    number: body.number,
  };

  //ID is automatically generated
  const newPerson = new Person(personPojo);
  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      console.log("Could not save new person!", error.message);
      next(error);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body; //Needs sanitization

  const personPojo = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, personPojo, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      response.json(person);
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
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
  if (error.name === "CastError") {
    return response.status(400).send({ error: "ID could not be parsed!" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.errors });
  }

  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
