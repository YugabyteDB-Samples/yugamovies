//Utility to log a hashed password for seed users.
const bcrypt = require("bcryptjs");
console.log(bcrypt.hashSync(process.env.PASSWORD, 8));
