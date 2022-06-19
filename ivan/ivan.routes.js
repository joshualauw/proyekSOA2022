const {createOrder, cancelOrder, getOrder, setPriceNotification} = require('./ivan.controller')
const { checkToken } = require('../helpers/functions')
const Router = require('express').Router()

const { orderSchema, alertSchema } = require('./schema')

function genFormValidation(schema){
    return (req,res,next) =>{
        const validationResult = schema.validate(req.body)
        if(validationResult.error){
            return res.status(400).send({message: validationResult.error.details[0].message})
        }else{
            req.data = validationResult.value
            next()
        }
    }
  }

Router.post('/order', [genFormValidation(orderSchema), checkToken], createOrder)
Router.delete('/order/:id', checkToken, cancelOrder)
Router.get('/order/:id?', checkToken, getOrder)
Router.get('/alert', [checkToken], setPriceNotification)
Router.post('/alert', [genFormValidation(alertSchema), checkToken], setPriceNotification)

module.exports = Router