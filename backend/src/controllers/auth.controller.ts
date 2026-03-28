// Author: Denys(Ezpectus)
// Files: prisma.ts, env.ts, auth.middleware.ts, auth.controller.ts, video.controller.ts, comment.controller.ts

import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const authController = {
    async register(req:Request , res: Response){
        try {
        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({ message : " Missing fileds"});
        
        const result = await authService.register(email,password);
        return res.json(result);
   
             } catch(error) {
               return res.status(500).json({ message: "Server error" });
          }
        },


     async login(req: Request, res: Response) { 
        try {
         const{ email,password} = req.body;
        if(!email || !password)  return res.status(400).json({message : "Missing something"});

        const result  = await authService.login(email,password);
        return res.json(result);

          } catch(error) {
            return res.status(500).json({ message: "Server error" });
       }
    }
}
