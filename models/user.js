const mongoose= require('mongoose');

const userSchema= mongoose.Schema({
    username:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minlength: [8,"Password must be atleast of length 8"],
    },
    email:{
        type: String,
        required: true,
        maxlength: 50,
        unique: true
    },
    profilePic:{
        type: String,
        default: ""
    },
    coverPic:{
        type: String,
        default: ""
    },
    followers:{
        type: Array,
        default: []
    },
    following:{
        type: Array,
        default: []
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
},{timestamps: true}

);

module.exports=mongoose.model("User", userSchema);