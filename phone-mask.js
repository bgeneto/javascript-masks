/**
 * @fileoverview A JavaScript class for formatting and validating phone numbers.
 * @version 1.0.8
 * @author Bernhard Enders
 * @license MIT
 * @modified 2025-02-12
 */

class PhoneNumberMask {

    static DEFAULT_MESSAGES = {
        'en': 'Please enter a valid phone number.',
        'en-US': 'Please enter a valid phone number.',
        'pt': 'Digite um número de telefone válido.',
        'pt-BR': 'Digite um número de telefone válido.',
        'es': 'Ingrese un número de teléfono válido.',
        'fr': 'Veuillez entrer un numéro de téléphone valide.',
        'de': 'Bitte geben Sie eine gültige Telefonnummer ein.',
    };

    constructor(inputElementOrSelector, options = {}) {
        if (typeof inputElementOrSelector === 'string') {
            this.input = document.querySelector(inputElementOrSelector);
        } else if (inputElementOrSelector instanceof HTMLElement) {
            this.input = inputElementOrSelector;
        } else {
            throw new Error("Invalid input element or selector provided to PhoneNumberMask.");
        }

        if (!this.input) {
            throw new Error("Input element not found for PhoneNumberMask.");
        }

        this.options = {
            masks: ["(##) #####-####"], // Default
            messages: {
                ...PhoneNumberMask.DEFAULT_MESSAGES,
                ...(options.messages || {})
            },
            ...options
        };

        if (!Array.isArray(this.options.masks)) {
            this.options.masks = [this.options.masks];
        }

        this.masksData = this.options.masks.map(mask => this.parseMask(mask));
        this.activeMaskIndex = -1;

        this.setupEventListeners();

        // *** Crucial: Apply mask to initial value ***
        const initialValue = this.input.value;
        if (initialValue) {
            this.setValue(initialValue);
        }
    }

    parseMask(mask) {
        const placeholderChar = '#';
        let regexStr = '^';
        let placeholders = [];
        let charIndex = 0;
        let digitCount = 0;

        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === placeholderChar) {
                regexStr += '(\\d?)';
                placeholders.push({ index: i, charIndex: charIndex });
                charIndex++;
                digitCount++;
            } else {
                regexStr += this.escapeRegExp(mask[i]);
            }
        }
        regexStr += '$';

        return {
            regex: new RegExp(regexStr),
            placeholders,
            mask,
            placeholderChar,
            digitCount
        };
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    getErrorMessage() {
        const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        for (const language of userLanguages) {
            if (this.options.messages[language]) return this.options.messages[language];
            const generalLanguage = language.split('-')[0];
            if (this.options.messages[generalLanguage]) return this.options.messages[generalLanguage];
        }
        return this.options.messages['en'] || PhoneNumberMask.DEFAULT_MESSAGES['en'];
    }

    static getLocalizedMessage() {
        const userLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
        for (const language of userLanguages) {
            if (PhoneNumberMask.DEFAULT_MESSAGES[language]) return PhoneNumberMask.DEFAULT_MESSAGES[language];
            const generalLanguage = language.split('-')[0];
            if (PhoneNumberMask.DEFAULT_MESSAGES[generalLanguage]) return PhoneNumberMask.DEFAULT_MESSAGES[generalLanguage];
        }
        return PhoneNumberMask.DEFAULT_MESSAGES['en'];
    }

    static apply(selector, options = {}) {
        document.querySelectorAll(selector).forEach(input => new PhoneNumberMask(input, options));
    }

    setupEventListeners() {
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.input.addEventListener('paste', this.handlePaste.bind(this));
    }

    handleKeyDown(event) {
        const keyCode = event.keyCode;

        if ((event.ctrlKey || event.metaKey) && [65, 67, 86, 88].includes(keyCode) ||
            [9, 27, 13].includes(keyCode) || (keyCode >= 35 && keyCode <= 40)) {
            return;
        }

        if (keyCode === 8 || keyCode === 46) { // Backspace or Delete
            event.preventDefault();

            let start = this.input.selectionStart;
            let end = this.input.selectionEnd;
            let unmaskedValue = this.getUnmaskedValue();
            let newUnmaskedValue = unmaskedValue;
            let cursorPos = this.getCursorPosInUnmaskedValue(start);

            const maskData = this.masksData[this.activeMaskIndex];

            if (start === end) { // No selection
                if (keyCode === 8) { // Backspace
                    let prevDigitPos = start - 1;
                    while (prevDigitPos >= 0 && maskData.mask[prevDigitPos] !== maskData.placeholderChar) {
                        prevDigitPos--;
                    }
                    if (prevDigitPos >= 0) {
                        cursorPos = this.getCursorPosInUnmaskedValue(prevDigitPos);
                        newUnmaskedValue = unmaskedValue.slice(0, cursorPos) + unmaskedValue.slice(cursorPos + 1);
                    }
                } else if (keyCode === 46) { // Delete
                    let nextDigitPos = start;
                    while (nextDigitPos < maskData.mask.length && maskData.mask[nextDigitPos] !== maskData.placeholderChar) {
                        nextDigitPos++;
                    }
                    if (nextDigitPos < maskData.mask.length) {
                        let deleteIndex = this.getCursorPosInUnmaskedValue(nextDigitPos);
                        newUnmaskedValue = unmaskedValue.slice(0, deleteIndex) + unmaskedValue.slice(deleteIndex + 1);
                    }
                }
            } else { // Selection exists
                newUnmaskedValue = unmaskedValue.slice(0, this.getCursorPosInUnmaskedValue(start)) + unmaskedValue.slice(this.getCursorPosInUnmaskedValue(end));
                cursorPos = this.getCursorPosInUnmaskedValue(start);
            }


            this.setValue(newUnmaskedValue);
            this.setCursorPositionInFormatted(cursorPos);

        } else if ((event.shiftKey || (keyCode < 48 || keyCode > 57)) && (keyCode < 96 || keyCode > 105)) {
            event.preventDefault();
        }
    }

    getCursorPosInUnmaskedValue(formattedCursorPos) {
        if (this.activeMaskIndex === -1) return formattedCursorPos;
        const maskData = this.masksData[this.activeMaskIndex];
        let unmaskedCursorPos = 0;
        for (let i = 0; i < formattedCursorPos; i++) {
            if (maskData.mask[i] === maskData.placeholderChar) unmaskedCursorPos++;
        }
        return unmaskedCursorPos;
    }

    setCursorPositionInFormatted(unmaskedCursorPos) {
        if (this.activeMaskIndex === -1) {
            this.input.setSelectionRange(unmaskedCursorPos, unmaskedCursorPos);
            return;
        }

        const maskData = this.masksData[this.activeMaskIndex];
        let formattedCursorPos = 0;
        let unmaskedCount = 0;

        for (let i = 0; i < maskData.mask.length; i++) {
            if (maskData.mask[i] === maskData.placeholderChar) {
                if (unmaskedCount === unmaskedCursorPos) {
                    formattedCursorPos = i;
                    break;
                }
                unmaskedCount++;
            }
            formattedCursorPos++;
        }

        while (formattedCursorPos < maskData.mask.length && maskData.mask[formattedCursorPos] !== maskData.placeholderChar) {
            formattedCursorPos++;
        }
        this.input.setSelectionRange(formattedCursorPos, formattedCursorPos);
    }

    handlePaste(event) {
        event.preventDefault();
        const pastedData = (event.clipboardData || window.clipboardData).getData('text');
        this.setValue(pastedData.replace(/\D/g, ''));
        this.adjustCursorPosition();
    }

    handleInput(event) {
        if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') return;

        let value = event.target.value;
        let digits = value.replace(/\D/g, '');
        let bestMatchIndex = -1;
        let bestMatchDiff = Infinity;
        let bestFormatted = '';

        for (let maskIndex = 0; maskIndex < this.masksData.length; maskIndex++) {
            const maskData = this.masksData[maskIndex];
            let formatted = '';
            let digitIndex = 0;

            for (let i = 0; i < maskData.mask.length; i++) {
                if (maskData.mask[i] === maskData.placeholderChar) {
                    formatted += digitIndex < digits.length ? digits[digitIndex++] : '';
                } else {
                    formatted += maskData.mask[i];
                }
            }

            if (maskData.regex.test(formatted)) {
                const diff = Math.abs(maskData.digitCount - digits.length);
                if (diff < bestMatchDiff) {
                    bestMatchDiff = diff;
                    bestMatchIndex = maskIndex;
                    bestFormatted = formatted;
                }
            }
        }

        this.activeMaskIndex = bestMatchIndex;

        if (bestMatchIndex !== -1 && this.masksData[bestMatchIndex].regex.test(bestFormatted)) {
            event.target.value = bestFormatted;
        } else {
            event.target.value = digits;
        }

        this.validateInput();
        this.adjustCursorPosition();
    }

    handleBlur(event) {
        this.validateInput();
    }

    getUnmaskedValue() {
        return this.input.value.replace(/\D/g, '');
    }

    getValue() {
        if (!this.input || !this.input.value) return null;
        const unmaskedValue = this.input.value.replace(/\D/g, '');
        return unmaskedValue.length === 0 ? null : Number(unmaskedValue);
    }

    setValue(value) {
        if (!this.input) return;

        if (value === null || value === undefined || value === '') {
            this.input.value = '';
            this.activeMaskIndex = -1;
            this.validateInput(); // Still validate for consistent behavior
            return;
        }

        let stringValue = String(value).replace(/\D/g, '');
        let bestMatchIndex = -1;
        let bestMatchDiff = Infinity;
        let bestFormatted = '';

        for (let maskIndex = 0; maskIndex < this.masksData.length; maskIndex++) {
            const maskData = this.masksData[maskIndex];
            let formatted = '';
            let digitIndex = 0;

            for (let i = 0; i < maskData.mask.length; i++) {
                if (maskData.mask[i] === maskData.placeholderChar) {
                    formatted += digitIndex < stringValue.length ? stringValue[digitIndex++] : '';
                } else {
                    formatted += maskData.mask[i];
                }
            }

            if (maskData.regex.test(formatted)) {
                const diff = Math.abs(maskData.digitCount - stringValue.length);
                if (diff < bestMatchDiff) {
                    bestMatchDiff = diff;
                    bestMatchIndex = maskIndex;
                    bestFormatted = formatted;
                }
            }
        }

        this.activeMaskIndex = bestMatchIndex;

        if (bestMatchIndex !== -1 && this.masksData[bestMatchIndex].regex.test(bestFormatted)) {
            this.input.value = bestFormatted;
        } else {
            this.input.value = stringValue;
        }

        this.validateInput(); // Validate after setting
    }

    adjustCursorPosition() {
        if (this.activeMaskIndex !== -1) {
            const maskData = this.masksData[this.activeMaskIndex];
            let cursorPosition = this.input.selectionStart;
            while (cursorPosition < this.input.value.length && maskData.mask[cursorPosition] !== maskData.placeholderChar) {
                cursorPosition++;
            }
            this.input.setSelectionRange(cursorPosition, cursorPosition);
        }
    }

    validateInput() {
        if (this.activeMaskIndex !== -1) {
            const maskData = this.masksData[this.activeMaskIndex];
            const isValidRegex = maskData.regex.test(this.input.value);
            const unmaskedValue = this.getUnmaskedValue();
            const isValidDigitCount = unmaskedValue.length === maskData.digitCount;

            if (isValidRegex && isValidDigitCount) {
                this.input.setCustomValidity('');
            } else {
                this.input.setCustomValidity(this.getErrorMessage());
            }
        } else {
             // No mask, but still valid if not empty
            this.input.setCustomValidity(this.input.value ? '' : this.getErrorMessage());
        }
    }
}
