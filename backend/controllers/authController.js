import imagekit from "../config/imagekit.js"
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";


const createToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}


const signup = async(req, res) => {
    try{
        //get the data from the frontend
        const { name, email, password, avatar} = req.body;
        
        //check the data is correct or not?
        if(!name || !email || !password){
            return res.status(400)
            .json({message: "Name, emailId and password are required"});
        }

        const existingUser = await User.findOne({email: email})
    if(existingUser){
        return res
        .status(400).json({message: "EmailId alredy exists"});
    }

    let avatarUrl = "";
    if(avatar){
        const uploadResponse = await imagekit.upload({
            file: avatar,
            filename: `avatar_${Date.now()}.jpg`,
            folder: "/mern-music-player",
        });

        avatarUrl = uploadResponse.url;
    }

    


    const user = await User.create({
        name,
        email,
        password,
        avatar: avatarUrl,
    });

const token = createToken(user._id);

    res.status(201).json({message: "User Created successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },
        token,
     });
    }catch(error){
        console.error("Signup not successfull");
        res.status(500).json({message: "Signup Error"});
    }
};

const login = async(req, res) =>{
    try{
    const {email, password} =req.body;


    if(!email || !password){
        res.staus(400).json({message: "Email and Password are Required"});
    }
    const user = await User.findOne({ email: email});
    if(!user){
        return res.status(400).json({message: "Email Id doesn't exists"});
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return res.status(200).json({message: "Invalid credentials"})
    }


    const token = createToken(user._id);
    res.status(200).json({
        message: "User Logged in successfully",
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
        },
        token,
    });
}catch(error){
    console.log("Signup not successful");
    res.status(500).json({message: "Signup Error"});
}
};


//protected controller
const getMe = async (req, res) => {

    if(!req.user) return res.status(401).json({message: "Not Authenticated"})

    res.status(200).json(req.user);
};


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({message: "Email is required"});

        const user = await()
    }
}

export { getMe, signup, login};
