import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 3000


app.get("/",(req,res)=>{
    res.json({status:false})
})

const connectDB = async () =>{
    await mongoose.connect("mongodb://localhost:27017/Trabajo_Practico_Final_Nodejs")
    console.log("Conectado a mongodb")
}

const productSchema = new mongoose.Schema({

    //Videojuegos
    nombre:{type:String,required:true}, //nombre del videojuego
    precio:{type:Number,required:true}, //precio del videojuego
    genero:{type:String,required:true}, //genero del videojuego
    empresa:{type:String,required:true}, //empresa desarrolladora del videojuego 
    descripcion:{type:String,required:true}, //descripcion del videojuego
    calificacion:{type:Number,required:true} //calificacion numerica del videojuego

},{
    versionKey:false
})

const userSchema = new mongoose.Schema({

    //usuarios
    email:{type:String,required:true,unique:true}, //email del usuario
    password:{type:String,required:true}, //password del usuario

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

app.get("/productos",async(req,res)=>{
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

        //videojuegos
        nombre, //nombre del videojuego
        precio, //precio del videojuego
        genero, //genero del videojuego
        empresa, //empresa desarrolladora del videojuego
        descripcion, //descripcion del videojuego
        calificacion //calificacion numerica del videojuego
    })

    await nuevoProducto.save()
    res.json(nuevoProducto)

})

app.patch("/productos/:id",authMiddleware,async (req,res)=>{
    const body = req.body
    const id = req.params.id

    const actualizacionProducto = await Producto.findByIdAndUpdate(id,body,{new:true})

    if(!actualizacionProducto){
        return res.status(404).json({error:"Producto no encontrado"})
    }

    res.json(actualizacionProducto)
})


app.delete("/productos/:id",authMiddleware,async (req,res)=>{
    const id = req.params.id

    const eliminadoProducto = await Producto.findByIdAndDelete(id)

    if(!eliminadoProducto){
        return res.status(404).json({error:"Producto no encontrado"})
    }

    res.json(eliminadoProducto)
})

app.listen(PORT,()=>{
    connectDB()
    console.log("Servidor conectado")
})

