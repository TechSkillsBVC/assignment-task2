const bcrypt = require('bcrypt');

const password = 'Basketball1'; // Replace with Shadman's password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});
