const { UserInfo, UserAppState, Country } = require("../models/models")

class LanguageService {

   async setLanguage(userInfoId) {
        let currentLanguage
        if (!userInfoId) {
            currentLanguage = 'english'
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