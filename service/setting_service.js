const { UserAppSetting } = require('../models/models')

class SettingService {

    async checkUserAppSetting(setting, userInfoId) {
        let full_setting = await UserAppSetting.findOne({ where: { userInfoId, name: setting } })
        if (full_setting) {
            return (full_setting.value)
        } else {
            return false
        }
    }
}

module.exports = new SettingService()