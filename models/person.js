const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const phoneNumberValidators = [
  {
    validator: function (v) {
      return v.length >= 8;
    },
    message: 'Phone number must be at least 8 characters in length!', //apparently counting the hyphen?
  },
  {
    validator: function (v) {
      return !/[^0-9-]/.test(v);
    },
    message: 'Phone number may not contain anything except numbers and a dash!',
  },
  {
    validator: function (v) {
      return /^\d*-\d*$/.test(v);
    },
    message: 'Phone number must contain exactly one dash!',
  },
  {
    validator: function (v) {
      return /^\d{2,3}-/.test(v);
    },
    message:
      'Phone number must start with exactly 2 or 3 numbers before the dash!',
  },
];
const personSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 3,
    required: true,
    validate: phoneNumberValidators,
  },
});

//Turn the ID object into a string, and delete _v
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
