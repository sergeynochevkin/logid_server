const SMSru = require('sms_ru');

class SmsService {

    constructor() {
        this.sms = new SMSru(process.env.SMS_RU_API_ID);
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

// smsService.sendSms('79118338221', 'Postupil novyj zakaz 5, podhodjashhij dlja vashego transporta. logid.app/?order_id=1&&order_status=inWork')

// SMS send:

// sms.sms_send({
//   to: '79112223344',
//   text: 'SMS text'
// }, function(e){
//   console.log(e.description);
// });
 
 
// sms.sms_send({
//   multi: [
//     ['79112223344', 'SMS text'],
//     ['79115556677', 'SMS text'],
//     ['79115552255', 'SMS text']
//   ], function(e){
//     console.log(e.description);
// });
// Статус SMS:

// sms.sms_status('SMS id', callback);
//  SMS cost:

// sms.sms_cost({
//   to: '79112223344',
//   text: 'SMS text'
// }, callback);
// Balance:

// sms.my_balance(function(e){
//   console.log(e.balance);
// })
// Day лимит:

// sms.my_limit(function(e){
//   console.log(e.current+' / '+e.total);
// })
// Movers:

// sms.my_senders(function(e){
//   console.log(e.senders);
// })
// Add number to stoplist:

// sms.stoplist_add({
//   phone:'79112223344',
//   text:'Comment'
// }, callback)
// Stop_list delete:

// sms.stoplist_del({
//   phone:'79112223344',
// }, callback)
// Recieve stoplist:

// sms.stoplist_get(function(e){
//   console.log(e.stoplist);
// })