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
            const dogs = await Dog.find(); //In mongoose, find() with no arguments returns all documents in the collection
            res.render("dogs", { dogs }); // res.render takes two arguments: the name of the view (dogs.ejs) and an object containing data to be passed to the view

        } catch (error) {
            console.error("Error rendering dog list:", error);
            res.status(500).send("Internal server error");
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

            if (dog.owner.equals(userId)) { // equals is a method that converts a string or ObjectId to ObjectId and compares them
                return res.status(400).json({ error: "You cannot adopt your own dog" });
            }

            dog.adoptedBy = userId;

            await dog.save(); // Save the updated dog document to the database
            res.redirect("/adoptedDogs");
            // res.status(200).json({ message: "Dog adopted successfully", dog });
        } catch (error) {
            console.error("Error adopting dog:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
};

module.exports = dogController;