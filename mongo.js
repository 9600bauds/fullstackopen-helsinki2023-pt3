require("dotenv").config();
const mongoose = require("mongoose");

const password = process.env.MONGO_PW;

if (!password) {
  console.log("No password provided for Mongoose!");
  process.exit(1);
}

const url = `mongodb+srv://fullstack:${password}@9600cluster.rqcu8g5.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});

const Person = mongoose.model("Note", personSchema);

if (process.argv.length < 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else {
  const newname = process.argv[2];
  const newnumber = process.argv[3];
  const person = new Person({
    name: newname,
    number: newnumber,
  });
  person.save().then((result) => {
    console.log("Person saved!", result);
    mongoose.connection.close();
  });
}
