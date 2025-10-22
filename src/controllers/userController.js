const {StatusCodes} = require("http-status-codes")
const bcrypt = require("bcrypt")
const Users = require("../schema/UserModel.js");
const generateJwtToken = require("../utils/genToken.js");

async function registerUser(req,res) {
    console.log("Request URL : ", req.url)
    console.log("Request Method : ", req.method)
    try{
        const {name, email, password} = req.body

        if (!name || !email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({message: "All fields are required"})
        }
        const existingUser = await Users.findOne({email})

        if(existingUser){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Email Address already exists"
            })
        }
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await Users.create({
            name:name,
            email:email,
            password:hashedPassword
        })
        
         //* Generate JWT token
         const token = generateJwtToken(user)

        if (user){
            return res.status(StatusCodes.CREATED).json({
                  message: "User registered successfully",
                  user:{
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    token: token,
                    cashBalance: user.cashBalance,                  
                  }
            })
        }else{
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid user data" });
        }
    }
    catch(error){
        return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
           reason: "unable to process your request at the moment, please try later",
        });
    }
}

async function loginUser(req,res) {
    console.log("Request URL : ", req.url)
    console.log("Request Method : ", req.method)
    
    try{
        const {email, password} = req.body;

        const user = await Users.findOne({email})

        if(!user){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User not found. Please check your email."
            })
        }
        const result = bcrypt.compare(password, user.password)

        if(!result){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "please check your credential"
            })
        }
        //* Generate JWT token
        const token = generateJwtToken(user)

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            user:{
                    _id:user._id,
                    name:user.name,
                    email:user.email,
                    token: token,
                    cashBalance: user.cashBalance, 
                }
        })

    }
    catch(error){
        console.log(error)
        return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
            reason: "Unable to process your request at the moment, please try later."
        })
    }
}

async function userProfile(req, res) {
  console.log("Request URL : ", req.url);
  console.log("Request Method : ", req.method);

  try {
    const user = await Users.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    return res.status(StatusCodes.OK).json({
      message: "Got User profile",
      user,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
}
module.exports = { registerUser, loginUser, userProfile}