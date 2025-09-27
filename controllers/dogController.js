const Dog = require("../models/DogModel");

const dogController = {
    getNewDogForm: (req, res) => {
        res.render("newDog");
    },
    
    createDog: async (req, res) => {
        try {
            const { name, description } = req.body;

            if (!name?.trim() || !description?.trim()) {
                return res.status(400).json({ error: "Name and description are required" });
            }
            const newDog = new Dog({ name, description, owner: req.user._id });

            await newDog.save();
            // res.status(201).json({ message: "Dog profile created successfully", dog: newDog });
            res.redirect("/dogs");
        } catch (error) {
            console.error("Error creating dog profile:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getDogs: async (req, res) => {
        try {
            const dogs = await Dog.find();
            res.status(200).json(dogs);
        } catch (error) {
            console.error("Error fetching dog profiles:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    renderDogList: async (req, res) => {
        try {
            const dogs = await Dog.find().populate('owner'); //In mongoose, find() with no arguments returns all documents in the collection
            res.render("dogs", { dogs }); // res.render takes two arguments: the name of the view (dogs.ejs) and an object containing data to be passed to the view

        } catch (error) {
            console.error("Error rendering dog list:", error);
            res.status(500).send("Internal server error");
        }
    },

    getAdopt: async (req, res) => {
        try{
            const dogId = req.params.id;
            const dog = await Dog.findById(dogId);
            if(!dog){
                return res.status(404).send("Dog not found");
            }

        res.render("adoptDogForm", { dog });
        } catch(error) {
            console.error(error);
            res.status(500).send("Error loading adoption form");
        }
    },

    adoptDog: async (req, res) => {
        try {
            console.log("req.user:", req.user);
            console.log("req.params.id:", req.params.id);

            const dogId = req.params.id;
            const userId = req.user._id;

            const dog = await Dog.findById(dogId);
            if (!dog) {
                return res.status(404).json({ error: "Dog not found" });
            }

            if (dog.adoptedBy) {
                return res.status(400).json({ error: "Dog has already been adopted" });
            }

            if (dog.owner.toString() === userId.toString()) {
                return res.status(400).json({ error: "You cannot adopt your own dog" });
            }

            dog.adoptedBy = userId;
            dog.thankYouMessage = req.body.thankYouMessage || "";

            await dog.save(); // Save the updated dog document to the database
            res.redirect("/dogs/dogsIHaveAdopted");
            // res.status(200).json({ message: "Dog adopted successfully", dog });
        } catch (error) {
            console.error("Error adopting dog:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    adoptedDogs: async (req, res) => {
        try {
            const userId = req.user._id;
            const adoptedDogs = await Dog.find({ adoptedBy: userId }).populate("owner"); //queries my dog collection and finds all dogs where adoptedBy equals the currently logged in user. .populate tells mongoose for every owner field to look up the document in the users collection with that id and replace the ObjectId with that full user document in memory, which is assigned to our variable (adoptedDogs)
            res.render("dogsIHaveAdopted", { dogs: adoptedDogs }); // render the adoptedDogs ejs and pass an object to it where the key is dogs and the value is adoptedDogs
        } catch (error) {
            console.error("Error fetching adopted dogs:", error );
            res.status(500).send("Internal server error")
        }

    },

allMyRegisteredDogs: async (req, res) => {
  try {
    const ownerId = req.user._id;
    let filter = { owner: ownerId };

    if (req.path.endsWith("/adopted")) {
      filter.adoptedBy = { $ne: null }; // Only adopted dogs
    } else if (req.path.endsWith("/available")) {
      filter.adoptedBy = null; // Only available dogs
    }

    // Populate the adoptedBy field to get the adopter's user document
    const myDogs = await Dog.find(filter).populate("adoptedBy", "username"); 
    // Only fetch the username from the adopter document

    res.render("myRegisteredDogs", { dogs: myDogs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading your dogs");
  }
},

removeDog: async (req, res) => {
  try {
    const ownerId = req.user._id;// Logged-in user
    const dogId = req.params.id;// Dog ID from the URL

    // Find the dog and make sure the owner matches
    const dog = await Dog.findOne({ _id: dogId, owner: ownerId });

    if (!dog) {
      return res.status(404).json({ error: "Dog not found or you are not the owner" });
    }

    // Delete the dog
    await Dog.deleteOne({ _id: dogId });

    res.redirect("/dogs"); // back to dog list
  } catch (error) {
    console.error("Error removing dog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
},

myDogs: async (req, res) => {
    res.render("myDogs")
}

};

module.exports = dogController;