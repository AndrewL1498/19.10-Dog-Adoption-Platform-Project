const Dog = require("../models/DogModel");

const dogController = {
    get: (req, res) => {
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
};

module.exports = dogController;