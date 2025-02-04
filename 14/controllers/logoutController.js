const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken (front-end)

    const cookies = req.cookies;
    // check if cookies exist then if it has the jwt property
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // is refreshtoken in db?

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken)
    if (!foundUser) { 
        res.clearCookie('jwt', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.sendStatus(204);

    }
    // delete the refreshtoken
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken)
    const currentUser = {...foundUser, refreshToken: ''};
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );

    res.clearCookie('jwt', {httpOnly: true}); // secure: true - only serves on https
    res.sendStatus(204);
   
}        
       
module.exports = { handleLogout }