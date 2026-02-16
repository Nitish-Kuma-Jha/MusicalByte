import imagekit from "../config/imagekit.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendMail from "../utils/sendEmail.js";

dotenv.config();

// JWT token creation
const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Signup controller
const signup = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        let avatarUrl = "";
        if (avatar) {
            const uploadResponse = await imagekit.upload({
                file: avatar,
                filename: `avatar_${Date.now()}.jpg`,
                folder: "/mern-music-player",
            });
            avatarUrl = uploadResponse.url;
        }

        const user = await User.create({ name, email, password, avatar: avatarUrl });
        const token = createToken(user._id);

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            token,
        });
    } catch (error) {
        console.error("Signup not successful:", error.message);
        res.status(500).json({ message: "Signup Error" });
    }
};

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Email does not exist" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = createToken(user._id);

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Login Error" });
    }
};

// Protected controller: get current user
const getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("GetMe error:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// Forgot password controller
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found" });

        // Generate token
        const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

        // Hash token before saving in DB
        const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // URL for frontend reset
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send email
        await sendMail({
            to: user.email,
            subject: "Reset your password",
            html: `
                <h3>Password Reset</h3>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 10 minutes</p>
            `,
        });

        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Forgot Password error:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};


const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const password = req.body.password;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// const editProfile = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({ message: "Not Authenticated" });
//     }

//     const { name, email, avatar, currentPassword, newPassword } = req.body;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (name) user.name = name;
//     if (email) user.email = email;

//     // 🔐 Password update
//     if (currentPassword || newPassword) {
//       if (!currentPassword || !newPassword) {
//         return res.status(400).json({
//           message: "Both current and new password are required",
//         });
//       }

//       const isMatch = await user.comparePassword(currentPassword);
//       if (!isMatch) {
//         return res.status(400).json({
//           message: "Current password is incorrect",
//         });
//       }

//       if (newPassword.length < 6) {
//         return res.status(400).json({
//           message: "New password must be at least 6 characters",
//         });
//       }

//       user.password = newPassword;
//     }

//     if (avatar) {
//       const uploadResponse = await imagekit.upload({
//         file: avatar,
//         filename: `avatar_${Date.now()}.jpg`,
//         folder: "/mern-music-player",
//       });

//       user.avatar = uploadResponse.url;
//     }

//     await user.save();

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//       },
//     });
//   } catch (error) {
//     console.error("Edit Profile error:", error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };


const editProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Not Authenticated" });
        }
        const { name, email, avatar, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) user.name = name;
        if (email) user.email = email;

        if(currentPassword || newPassword){
            if(!currentPassword || !newPassword){
                return res.status(400).json({message: "Both current and new password are required"});
            }
            const isMatch = await user.comparePassword(currentPassword);
            if(!isMatch){
                return res.status(400).json({message: "Current password is incorrect"});
            }
            if(newPassword.length < 6){
                return res.status(400).json({message: "New password must be at least 6 characters"});
            }
            user.password = newPassword;
        }

        if(avatar){
            const uploadResponse = imagekit.upload({
                file: avatar,
                filename: `avatar_${Date.now()}.jpg`,
                folder: "/mern-music-player",
        });
        user.avatar = uploadResponse.url;
    }


        await user.save();

        return res.status(200).json({ 
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Edit Profile error:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};




export { getMe, signup, login, forgotPassword, resetPassword, editProfile };
