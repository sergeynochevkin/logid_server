class TranslateService {

    setNativeTranslate(language, phrase_object) {
        if (!language) {
            language = 'english'
        }
        let translatedText = phrase_object[language]
        translatedText = translatedText.join(' ')
        return translatedText
    }

}

module.exports = new TranslateService()