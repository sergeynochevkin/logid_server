class TranslateService {

    setTranslate(phrase_object, language) {
        if (!language) {
            language = 'english'
        }
        let translatedText = phrase_object[language]
        translatedText = translatedText.join(' ')
        return translatedText
    }

}

module.exports = new TranslateService()