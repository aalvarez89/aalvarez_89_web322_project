// Abstract Secret API KEY - (email.js is obfuscated in .gitignore)

class EmailAPI {
    key = ""
    domain = ""

    constructor() {
        this.key = "ed40f23e8850d50e4acc5d52c23f5866-87c34c41-daf3726d"
        this.domain = "sandboxecd676b6f34b46ddbe26fb35d9358ee2.mailgun.org"
    }

    getKey() {
        return this.key;
    }
    getDomain() {
        return this.domain;
    }
}

module.exports = EmailAPI;