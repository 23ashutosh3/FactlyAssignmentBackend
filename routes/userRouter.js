const router = require("express").Router();
const User=require("../models/userModel")
const Post=require("../models/post.jsx")
const bcrypt=require("bcrypt");
const auth = require("../middleware/auth")
const jwt=require('jsonwebtoken')
require("dotenv").config();

router.post("/register", async (req, res) => {
    try
      {
          let {email,password,passwordCheck,displayName}=req.body
          console.log(email)
          console.log(password)
          console.log(passwordCheck)
      
    if(!email||!password||!passwordCheck)
   
    return res.status(400).json({msg:"Not all fields have been entered"});
    if(password.length<5)
    return res.status(400).json({msg:"The pasword needs to be 5 character long"})
    if(password!==passwordCheck)
    return res.status(400).json({msg:"Enter the same password "})

    const existingUser=await User.findOne({email:email})

    const salt=await bcrypt.genSalt(10);
    const passwordHash=await bcrypt.hash(password,salt);


    console.log(passwordHash)
    if(existingUser)
    {
        return res.status(400).json({msg:"email already exist"})
    }
    if(!displayName)
    displayName=email;
    const newUser=new User({
        email,
        password:passwordHash,
        displayName,
    });

    const saveUser=await newUser.save();
    res.json(saveUser)
}

    catch(err)
    {

        res.status(500).json({error:err.message});
    }
    
});

router.post("/login",async(req,res)=>{
try{
    const {email,password}=req.body;

    if(!email || !password)
    return res.status(400).json({msg:"Not all fields have been "});

    const user=await User.findOne({email:email});
    if(!user)
    {
        return res.status(400).json({msg:"No account with this email id has been registeres"})
    }
    console.log(password)
    console.log(user.password)
    const isMatch=await bcrypt.compare(password,user.password);
    console.log("hello",isMatch)
    if(!isMatch)
    {
        return res.status(400).json({msg:"Invalid credential"})
    }
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.json({
        token,
        user:{
            id:user._id,
            displayName:user.displayName,
            email:user.email
        }
    })
}
catch(err)
{
    console.log(err);
    res.status(500).json({error:err.messages});
}
})

router.delete("/delete",auth,async(req,res)=>
{
    try{
        const deleteUser=await User.findByIdAndDelete(req.user);
        res.json(deleteUser);
    }catch(err)
    {
        res.status(500).json({error:err.message})
    }
})

router.post("/tokenIsValid",async(req,res)=>{
    try{
const token=req.header("x-auth-token");
if(!token)
return res.json(false);

const verified=jwt.verify(token,process.env.JWT_SECRET)
if(!verified)
{
    return res.json(false);
}

const user=await User.findById(verified.id);
if(!user)
{
    return res.json(false);
}

return res.json(true);
    }catch(err)
    {
        res.status(500).json({error:err.message})
    }
})
router.get("/",auth,async(req,res)=>{
    const user=await User.findById(req.user);
    res.json({
        displayName:user.displayName,
        id:user._id,
    });
    
})


router.post("/post",auth, async (req, res) => {
    try
      {
    const {post,author,categories}=req.body
    const newUser=new Post({
        post,
        author,
        categories,
    });

    const saveUser=await newUser.save();
    res.json(saveUser)
}
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
    
});


router.get("/postbyId",auth, async (req, res) => {
    try
      {
           let{post_id}=req.query
        const post=await Post.findById({_id:post_id});
        res.json({
            post,
        });
}
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

router.put("/updatebyId",auth, async (req, res) => {
    try
      {
        let{post_id}=req.query

         const postData=await Post.findById({_id:post_id});
        if(!postData)
        {
            return res.status(401).json({
            err:"Bad request"
            })
        }
        const {post,author,categories}=req.body
        let obj={}
        obj.post=post;
        obj.author=author;
        obj.categories=categories;
        const saveUser=await postData.save(obj);
        res.json({
            message:"success",
            post,
        });

}
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
});

router.delete("/deletePost",auth,async(req,res)=>
{
    try{
        let{post_id}=req.query;

        const postData=await Post.findById({_id:post_id});
        if(!postData)
        {
            return res.status(401).json({
            err:"Bad request"
            })
        }

        const deleteUser=await Post.findByIdAndDelete({_id:post_id});
        res.json({message:"success",
        deleteUser});
    }catch(err)
    {
        res.status(500).json({error:err.message})
    }
})

module.exports = router;