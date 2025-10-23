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
    descripcion:{type:String,required:true},
    calificacion:{type:Number,required:true}

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

app.post("/auth/register",async (req,res)=>{
    const body = req.body
    const usuario = await Usuarios.findOne({email:body.email})

    if(usuario){
        return res.status(400).json({message:"El usuario ya existe"})
    }

    const hash = await bcrypt.hash(body.password,10)

    const nuevoUsuario = new Usuarios({
        email:body.email,
        password:hash
    })

    await nuevoUsuario.save()

    res.json(nuevoUsuario)
})

app.post("/auth/login",async (req,res)=>{
    const body = req.body

    const usuario = await Usuarios.findOne({email:body.email})

    if(!usuario){
        return res.status(401).json({status:"Usuario no encontrado"})
    }

    const passwordValidada = await bcrypt.compare(body.password,usuario.password)

    if(!passwordValidada){
        return res.status(401).json({status:"Usuario no encontrado"})
    }

    const token = jwt.sign({id:usuario.id,email:usuario.email},"Clave",{expiresIn:"1h"})
    res.json({token})
})

app.get("/productos",authMiddleware,async(req,res)=>{
    const producto = await Producto.find()
    res.json({producto})
})

app.post("/productos",authMiddleware,async(req,res)=>{
    const body = req.body
    const {nombre,precio,genero,empresa,descripcion,calificacion} = body

    if(!nombre || !precio || !genero || !empresa || !descripcion || !calificacion){
        return res.status(400).json({status:"Datos invalidos"})
    }

    const nuevoProducto = new Producto({
        nombre,
        precio,
        genero,
        empresa,
        descripcion,
        calificacion
    })

    await nuevoProducto.save()
    res.json(nuevoProducto)

})

