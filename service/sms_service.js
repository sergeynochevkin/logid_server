const SMSru = require('sms_ru');

class SmsService {

    constructor() {
        this.sms = new SMSru('B8AA97C4-1BDE-87EF-25D8-2B5D81E586D6');
    }

    async sendSms(to, text) {
        await this.sms.sms_send({
            to: to,
              text: text
            }, function(e){
              console.log(e.description);
        })
    }

}

module.exports = new SmsService()

// const smsService = require('../service/sms_service')

// Отправка SMS:

// sms.sms_send({
//   to: '79112223344',
//   text: 'Текст SMS'
// }, function(e){
//   console.log(e.description);
// });
 
 
// sms.sms_send({
//   multi: [
//     ['79112223344', 'Текст СМС'],
//     ['79115556677', 'Текст СМС'],
//     ['79115552255', 'Текст СМС']
//   ], function(e){
//     console.log(e.description);
// });
// Статус SMS:

// sms.sms_status('SMS id', callback);
// Стоимость SMS:

// sms.sms_cost({
//   to: '79112223344',
//   text: 'Текст SMS'
// }, callback);
// Баланс:

// sms.my_balance(function(e){
//   console.log(e.balance);
// })
// Дневной лимит:

// sms.my_limit(function(e){
//   console.log(e.current+' / '+e.total);
// })
// Отправители:

// sms.my_senders(function(e){
//   console.log(e.senders);
// })
// Добавить номер в стоплист:

// sms.stoplist_add({
//   phone:'79112223344',
//   text:'Примечание'
// }, callback)
// Удалить номер из стоп-листа:

// sms.stoplist_del({
//   phone:'79112223344',
// }, callback)
// Получить номера стоплиста:

// sms.stoplist_get(function(e){
//   console.log(e.stoplist);
// })