const { Op, where } = require("sequelize")
const YooKassa = require('yookassa');
const { Invoice, UserInfo } = require("../models/models");

class PaymentService {

    constructor() {
        this.yooKassa = new YooKassa({
            shopId: process.env.YOOKASSA_SHOP_ID,
            secretKey: process.env.YOOKASSA_SECRET_KEY
        })
    }

    async createPayment(invoice) {
        let order_details = { ...JSON.parse(invoice.order_details) }
        
        const payment = await this.yooKassa.createPayment({
            amount: {
                value: invoice.price,
                currency: "RUB"
            },
            confirmation: {
                type: "embedded",
                locale: "en_US"
            },
            customization: {
                modal: true
            },
            capture: true,
            description: `${invoice.id}`,

            receipt: {
                customer: {
                    email: order_details.email
                },
                items: [
                    {
                        description: order_details.description,
                        quantity: order_details.quantity,
                        amount: {
                            value: invoice.price,
                            currency: "RUB"
                        },
                        vat_code: "1"
                    }
                ]
            }
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