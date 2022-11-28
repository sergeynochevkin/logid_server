const { UserInfo } = require('../models/models')
const { v4 } = require('uuid');

module.exports = async function () {
    console.log('keys updating started...');
    let userInfos
    await UserInfo.findAll().then(data=>{
        userInfos = data
    })        

    userInfos.forEach(element => {
        UserInfo.update({ uuid: v4() }, { where: { id: element.id } })
    });
    console.log('keys updated!');
}















