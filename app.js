import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const app = express()
app.use(cors())
app.use(express.json())


app.get("/",(req,res)=>{
    res.json({status:false})
})

const connectDB = async () =>{
    await mongoose.connect("mongodb://localhost:27017/Trabajo_Practico_Final_Nodejs")
    console.log("Conectado a mongodb")
}

const productSchema = new mongoose.Schema({
    nombre:{type:String,required:true},
    precio:{type:Number,required:true},
    genero:{type:String,required:true},
    empresa:{type:String,required:true},
    descripsion:{type:String,required:true},

},{
    versionKey:false
})

const userSchema = new mongoose.Schema({
    nombre:{type:String,required:true,unique:true},
    password:{type:String,required:true},

},{
    versionKey:false
})

const Producto = mongoose.model("Producto",productSchema)
const Usuarios = mongoose.model("Usuarios",userSchema)

const authMiddleware = (req,res,next) =>{
    const token = req.headers.authorization

    if(!token){
        res.json({status:"Se necesita permiso"})
    }

    const decoded = jwt.verify(token,"Clave")
    next()
}
