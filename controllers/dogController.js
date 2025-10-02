const Dog = require("../models/DogModel");
const ExpressError = require("../helpers/expressError");


const dogController = {
    getNewDogForm: (req, res) => {
        res.render("newDog");
    },
    
    createDog: async (req, res, next) => {
        try {
            const { name, description } = req.body;

            if (!name?.trim() || !description?.trim()) {
                return next(new ExpressError("Name and description are required", 400)); // return next to stop the function from continuing with an error
            }
            const newDog = new Dog({ name, description, owner: req.user._id });

            await newDog.save();
            // res.status(201).json({ message: "Dog profile created successfully", dog: newDog });
            res.redirect("/dogs");
        } catch (error) {
            next(error); //next error here because there is no more code that can run after an error
        }
    },

    renderDogList: async (req, res, next) => {
        try {
            const dogs = await Dog.find().populate('owner'); //In mongoose, find() with no arguments returns all documents in the collection
            res.render("dogs", { dogs }); // res.render takes two arguments: the name of the view (dogs.ejs) and an object containing data to be passed to the view

        } catch (error) {
            next(error);
        }
    },

    getAdopt: async (req, res, next) => {
        try{
            const dogId = req.params.id;
            const dog = await Dog.findById(dogId);
            if(!dog){
                return next(new ExpressError("Dog not found", 404));
            }

        res.render("adoptDogForm", { dog });
        } catch(error) {
            console.error(error);
            next(error);
        }
    },

    adoptDog: async (req, res, next) => {
        try {
            console.log("req.user:", req.user);
            console.log("req.params.id:", req.params.id);

            const dogId = req.params.id;
            const userId = req.user._id;

            const dog = await Dog.findById(dogId);
            if (!dog) {
                return next(new ExpressError("Dog not found", 404));
            }

            if (dog.adoptedBy) {
                return next(new ExpressError("Dog has already been adopted", 400));
            }

            if (dog.owner.toString() === userId.toString()) {
                return next(new ExpressError("You cannot adopt your own dog", 400));
            }

            dog.adoptedBy = userId;
            dog.thankYouMessage = req.body.thankYouMessage || "";
            dog.status = 'Adopted'; // Update status to 'Adopted'

            await dog.save(); // Save the updated dog document to the database
            res.redirect("/dogs/dogsIHaveAdopted");
            // res.status(200).json({ message: "Dog adopted successfully", dog });
        } catch (error) {
            console.error("Error adopting dog:", error);
            next(error);
        }
    },

    adoptedDogs: async (req, res, next) => {
        try {
            const userId = req.user._id;
            const adoptedDogs = await Dog.find({ adoptedBy: userId }).populate("owner"); //queries my dog collection and finds all dogs where adoptedBy equals the currently logged in user. .populate tells mongoose for every owner field to look up the document in the users collection with that id and replace the ObjectId with that full user document in memory, which is assigned to our variable (adoptedDogs)
            res.render("dogsIHaveAdopted", { dogs: adoptedDogs }); // render the adoptedDogs ejs and pass an object to it where the key is dogs and the value is adoptedDogs
        } catch (error) {
            console.error("Error fetching adopted dogs:", error );
            next(error);
        }

    },

allMyRegisteredDogs: async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    let filter = { owner: ownerId };

    if (req.path.endsWith("/adopted")) {
      filter.adoptedBy = { $ne: null }; // Only adopted dogs
      filter.status = { $ne: "Removed" }; // Exclude removed dogs
    } else if (req.path.endsWith("/available")) {
      filter.adoptedBy = null; // Only available dogs
      filter.status = { $ne: "Removed" };
    } else if (req.path.endsWith("/removed")) {
      filter.status = "Removed"; // Only available dogs
    }

    // Populate the adoptedBy field to get the adopter's user document
    const myDogs = await Dog.find(filter).populate("adoptedBy", "username"); 
    // Only fetch the username from the adopter document

    res.render("myRegisteredDogs", { dogs: myDogs });
  } catch (error) {
    console.error(error);
    next(error);
  }
},

removeDog: async (req, res, next) => {
  try {
    const ownerId = req.user._id;// Logged-in user
    const dogId = req.params.id;// Dog ID from the URL

    // Find the dog and make sure the owner matches
    const dog = await Dog.findOne({ _id: dogId, owner: ownerId });

    if (!dog) {
      return next(new ExpressError("Dog not found or you are not the owner", 404));
    }

    dog.status = 'Removed'; // Soft delete by setting status to 'removed'
    await dog.save();

    res.redirect("/dogs"); // back to dog list
  } catch (error) {
    console.error("Error removing dog:", error);
    next(error);
  }
},

myDogs: (req, res) => {
    res.render("myDogs")
}

};

module.exports = dogController;