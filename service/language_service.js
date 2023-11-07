const { UserInfo, UserAppState, Country, User } = require("../models/models")

class LanguageService {

    async setLanguage(userInfoId, userId) {
        let currentLanguage
        if (!userInfoId && !userId) {
            currentLanguage = 'english'
        }
        if (!userInfoId && userId) {
            let user = await User.findOne({ where: { id: userId } })
            let country = await Country.findOne({ where: { value: user.country } })
            currentLanguage = country.default_language
        } else {
            let userInfo = await UserInfo.findOne({ where: { id: userInfoId } })
            let stateObject = await UserAppState.findOne({ where: { userInfoId } })
            let state
            if (stateObject) {
                state = JSON.parse(stateObject.state)
            }
            let country = await Country.findOne({ where: { value: userInfo.country } })
            if (!stateObject || !state.language) {
                currentLanguage = country.default_language
            } else if (state.language !== country.default_language && state.language !== 'english') {
                currentLanguage = country.default_language
            } else {
                currentLanguage = state.language
            }
        }
        return currentLanguage
    }
}

module.exports = new LanguageService()