class TranslateService {

    setTranslate(phrase_object) {
        let language = 'english' // получить решить откуда
        let translatedText = phrase_object[language]
        translatedText = translatedText.join(' ')
        return translatedText
    }
}

module.exports = new TranslateService()