/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 * @description This hook provides methods to interact with external APIs.
 */

import {useConstants} from "/src/hooks/constants.js"
import {useUtils} from "/src/hooks/utils.js"

const constants = useConstants()
const utils = useUtils()

export const useApi = () => {
    return {
        validators,
        handlers,
        analytics
    }
}

const validators = {
    /**
     * @param {String} name
     * @param {String} email
     * @param {String} subject
     * @param {String} message
     */
    validateEmailRequest: (name, email, subject, message) => {
        const minWordCountForMessage = 3

        const validations = [
            { errorCode: constants.ErrorCodes.VALIDATION_EMPTY_FIELDS,      errorCondition: !name || !email || !subject || !message },
            { errorCode: constants.ErrorCodes.VALIDATION_EMAIL,             errorCondition: !utils.validation.validateEmail(email) },
            { errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_LENGTH,    errorCondition: !utils.validation.isLongerThan(message, minWordCountForMessage),    messageParameter: minWordCountForMessage + 1},
            { errorCode: constants.ErrorCodes.VALIDATION_MESSAGE_SPAM,      errorCondition: utils.validation.isSpam(message) },
        ]

        const error = validations.find(validation => validation.errorCondition)
        return {
            success: !error,
            errorCode: error?.errorCode,
            errorParameter: error?.messageParameter,
            bundle: {
                name: name,
                from_name: name,
                email: email,
                from_email: email,
                custom_subject: subject,
                message: message,
                custom_source: utils.url.getAbsoluteLocation(),
                custom_source_name: "Ingridius Finelite Portfolio"
            }
        }
    }
}

const handlers = {
    /**
     * @return {Promise<{success: (*|boolean)}>}
     */
    dummyRequest: async () => {
        await new Promise((resolve) => setTimeout(resolve, 700))
        window._dummyRequestSuccess = !window._dummyRequestSuccess

        return {
            success: window._dummyRequestSuccess
        }
    },

    /**
     * @param {Object} validationBundle
     * @param {String} endpoint
     * @return {Promise<{success: boolean}>}
     */
    sendEmailRequest: async (validationBundle, endpoint = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/send-mail.php") => {
        try {
            const result = await fetch(endpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(validationBundle),
            })

            if(!result.ok)
                return {success: false}

            const response = await result.json()
            return {success: response.success === true}
        } catch {
            return {success: false}
        }
    }
}

const analytics = {
    /**
     * @description This method can be used to report a visit to an external analytics service.
     * Here, you can integrate Google Analytics, Mixpanel, or your own custom analytics implementation.
     * @returns {Promise<void>}
     */
    reportVisit: async() => {
        return Promise.resolve()
    }
}