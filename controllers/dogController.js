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
            res.status(201).json({ message: "Dog profile created successfully", dog: newDog });
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
    }

};

module.exports = dogController;