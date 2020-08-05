
// Require bcryptjs for password Encryption
const bcrypt = require('bcryptjs');

// Require mongoose and setup the Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    isAdmin: Boolean
})

const mealSchema = new Schema({
    imageUrl: String,
    name: String,
    synopsis: String,
    price: String,
    noOfMeals: Number,
    isTopPkg: Boolean
})

let Users;
let Meals;


module.exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        // Connection String to MongoDB Server
        let db = mongoose.createConnection(`mongodb+srv://kweizar:${process.env.MDB_PW}@cluster0-nzad7.gcp.mongodb.net/Seneca_AA?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
        
        // Fix deprecation warnings
        mongoose.set('useCreateIndex', true);

        db.on('error', (err) => {
            reject(err)
        })
        // Loads a collection called 'user_dbs' with the specified Schema [line6]
        db.once('open', () => {
            Users = db.model('user_dbs', userSchema);
            Meals = db.model('meal_dbs', mealSchema);
            resolve()
        })
    })

    
}


// CRUD Operations

// CREATE

module.exports.addUser = (data) => {//elaborate on resolve/reject
    return new Promise ((resolve, reject) => {
        
        // Set data to null if the form entry is an empty string
        for (let formEntry in data) {
            console.log(formEntry)
            if (data[formEntry] == '') data[formEntry] = null;
        }

        let newUser = new Users(data);


        // Encrypt the plain text contained in the new user i.e.:
        // newUser.password: "myPassword123"
        bcrypt.genSalt(10)  // Generate a "salt" using 10 rounds
        .then(salt=>bcrypt.hash(newUser.password,salt)) // use the generated "salt" to encrypt the password: "myPassword123"
        .then(hash=>{
            // Argument [hash] is the returned encrypted string
            // Store the resulting "hash" value into the dataset
            newUser.password = hash;

            // Save input data in database

            newUser.save((err) => {
                if (err) {
                    console.log(`ERROR: ${err}`)
                    reject()
                }
                else {
                    console.log(`User [${data.name}] stored in database: `)
                    resolve()
                }
            })
        })
        .catch(err=>{
            console.log(err); // Show any errors that occurred during the process
            reject("Hashing Error")
        });


        

    })
}

module.exports.createMeal = (data) => {
    return new Promise ((resolve, reject) => {
        
        for (let formEntry in data) {
            console.log(formEntry)
            if (data[formEntry] == '') data[formEntry] = null;
        }

        let newMeal = new Meals(data);

        newMeal.save((err) => {
            if (err) {
                console.log(`ERROR: ${err}`)
                reject()
            }
            else {
                console.log(`Meal [${data.name.toUpperCase()}] stored in database: `)
                resolve()
            }
        })
        


        

    })
}

// READ

// ???? EXEC THEN CATCH <-- WHAT ARE THEESE
module.exports.getUsers = (data) => {
    return new Promise ((resolve, reject) => {
        Users.find()
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedUsers) => {
            resolve(returnedUsers.map((user) => user.toObject()))
        }).catch((err) => {
            console.log(`Error retrieving Users: ${err}`)
            reject(err)
        })
    })
}

module.exports.getUsersByEmail = (inEmail) => {
    return new Promise ((resolve, reject) => {
        Users.find({email: inEmail})
        .exec() //tells mongoose that we should run this find as a promise.
        .then((returnedUsers) => {

            if(returnedUsers.length != 0) resolve(returnedUsers.map((user) => user.toObject()))
            else reject('No Users found')

        }).catch((err) => {
            console.log(`Error retrieving Users: ${err}`)
            reject(err)
        })
    })
}


// UPDATE

module.exports.editUser = (editData) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(editData.password,salt))
    })
}
// DELETE

// Helper Functions

module.exports.validateUser = (data) => {
    return new Promise((resolve, reject) => {
        if (data) {
            this.getUsersByEmail(data.email).then((foundStudent) => {
                
                // Pull the password "hash" value from the DB and compare it to "myPassword123" (match)
                bcrypt.compare(data.password, foundStudent[0].password).then((pwMatches) => {
                    if (pwMatches) {
                        // pwMatches === true
                        // resolve and pass the user back
                        console.log(foundStudent[0])
                        resolve(foundStudent)

                    } else {
                        // pwMatches === false
                        // reject pass error
                        reject("Passwords don't match")
                        return

                    }
                    
                });

            }).catch((err) => {
                reject(err)
                return
            })
        }

    })
}