const { User, UserSchema } = require('../models/User')
const users =require('../db.json')
const { Schema } = require('mongoose')
// console.log(users)
const userRouter = require('express').Router()


userRouter.get('/search', async(req,res)=>{
    const obj = Object.entries(req.query) 

    const search = {}
    for (let [key, value] of obj) {
        console.log(key,value)
        if(key==='income'){
            search['incomeDecimal'] = { $gt: Number(value) }
        }else{
            search[key] = { $gt: Number(value) }
        }
    }
 
    try {
        const users = await User.aggregate([
            {
                $addFields: {
                  incomeDecimal: {
                    $convert: {
                      input: '$income',
                      to: 'decimal',
                      onError: 0,
                      onNull: 0
                    }
                  }
                }
            },
            {
                $match: {...search}
            }
        ])
        console.log(users.length)
      res.status(200).json({users:users.length, data:users, message:'success'})
    } catch (error) {
      
    }
})
 
userRouter.get('/getUsers', async(req,res)=>{
    try {
        const response = await User.find()

        if(!response) return res.status(400).json({error:'error'})
        res.status(200).json({data:response, message:'Success'})
    } catch (error) {
        res.status(400).json({error:error.message, message:'Failed'})
    }
})

// 1. Users which have income lower than $5 USD and have a car of brand “BMW” or “Mercedes”.
userRouter.get('/question1', async(req,res)=>{
    try {
        const users = await User.aggregate([
            {
              $addFields: {
                incomeDecimal: {
                  $convert: {
                    input: '$income',
                    to: 'decimal',
                    onError: 0,
                    onNull: 0
                  }
                }
              }
            },
            {
              $match: {
                incomeDecimal: { $lt: 5 },
                car: { $in: ['BMW', 'Mercedes'] }
              }
            }
          ]); 
        res.status(200).json({data:users, message:'Success'})
    } catch (error) {
        res.status(500).json({error:error.message, message:'Failed'});
    }
})

// 2. Male Users which have phone price greater than 10,000.
userRouter.get('/question2', async(req,res)=>{
    try {
        const users = await User.aggregate([
            {
              $match: { 
                gender: 'Male',
                phone_price: { $gt: 10000}
              }
            }
          ]); 
        res.status(200).json({data:users, message:'Success'})
    } catch (error) {
        res.status(500).json({error:error.message, message:'Failed'});
    }
})

// 3. Users whose last name starts with “M” and has a quote character length greater than 15 and email includes his/her last name.
userRouter.get('/question3', async(req,res)=>{
    try { 
        const users = await User.find({
            last_name: /^M/, // Regular expression to match last names starting with "M" character length greater than 15, 
            $expr: { $gt: [ { $strLenCP: "$quote" }, 15 ] },  
        });
       
        const filteredUsers = users.filter(user => {
            const regex = new RegExp(user.last_name, 'i'); // 'i' flag for case-insensitive matching
            return regex.test(user.email);
        });

        res.status(200).json({users:filteredUsers.length, data:filteredUsers, message:'Success' })
    } catch (error) {
        res.status(500).json({error:error.message, message:'Failed'});
    }
})

// 4. Users which have a car of brand “BMW”, “Mercedes” or “Audi” and whose email does not include any digit.
userRouter.get('/question4', async(req,res)=>{
    try { 
        const carBrands = ["BMW", "Mercedes", "Audi"];
        const regexPattern = /\d/; // Regex pattern to match emails with digits
        const users = await User.find({
            car: { $in: carBrands },
            email: { $not: { $regex: regexPattern, $options: 'i' } }
        } );

        res.status(200).json({users:users.length, data:users, message:'Success' })
    } catch (error) {
        res.status(500).json({error:error.message, message:'Failed'});
    }
})

// 5. Show the data of top 10 cities which have the highest number of users and their average income.
userRouter.get('/question5', async(req,res)=>{
    try { 
        const result = await User.aggregate([
            {
                $group: {
                    _id: '$city',
                    totalUsers: { $sum: 1 },
                    averageIncome: { $avg: { $toDouble: '$income' } }
                }
            },
            {
                $sort: {
                    totalUsers: -1
                }
            },
            {
                $limit: 10
            }
        ]);

        res.status(200).json({users:result.length, data: result, message:'Success' })
    } catch (error) {
        res.status(500).json({error:error.message, message:'Failed'});
    }
});


 



userRouter.post('/create-user',async (req,res)=>{
    try {
        users.forEach(user => {
            user.phone_price = Number(user.phone_price)
        });
        const response = await User.insertMany(users)

        if(!response) return res.status(400).json({error:'error'})
        res.status(200).json({data:response, message:'success'})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

userRouter.delete('/delete', async(req, res)=>{
    try {
        const response = await User.deleteMany()
        res.status(200).json({data:response, message:'success'})

    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

module.exports = {
    userRouter
}