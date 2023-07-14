const { Op, where } = require("sequelize")
const YooKassa = require('yookassa');
const { Invoice } = require("../models/models");

class PaymentService {

    constructor() {
        this.yooKassa = new YooKassa({
            shopId: process.env.YOOKASSA_SHOP_ID,
            secretKey: process.env.YOOKASSA_SECRET_KEY
        })
    }

    async createPayment( price, invoice) {
      

        const payment = await this.yooKassa.createPayment({
            amount: {
                value: price,
                currency: "RUB"
            },
            confirmation: {
                type: "embedded",
                locale: "en_US"
            },
            customization:{
              modal:true  
            },
            capture: false, 
            description: `${invoice.id}`,
                         
        });

        await Invoice.update({ payment_id: payment.id }, { where: { id: invoice.id } }) //put it when paiment is success


        return (payment);
    }

    // no need 
    async getPayment(payment_id) {
        const payment = await this.yooKassa.getPayment({
            payment_id: payment_id
        })
    }

}

module.exports = new PaymentService()