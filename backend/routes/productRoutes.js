
import express from "express";
import Model from "../models/Product.js";
import {protect,admin} from "../middleware/auth.js";

const router=express.Router();

router.get("/",async(req,res)=>{ res.json(await Model.find()); });

router.post("/",protect,admin,async(req,res)=>{
  res.json(await Model.create(req.body));
});

router.put("/:id",protect,admin,async(req,res)=>{
  res.json(await Model.findByIdAndUpdate(req.params.id,req.body,{new:true}));
});

router.delete("/:id",protect,admin,async(req,res)=>{
  await Model.findByIdAndDelete(req.params.id);
  res.json({message:"Deleted"});
});

export default router;
