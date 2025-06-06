# PhoneNumberMask

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple yet powerfull JavaScript class for formatting and validating phone numbers.

**Table of Contents**
-----------------

1. [Installation](#installation)
2. [Usage](#usage)
3. [Options](#options)
4. [Methods](#methods)
5. [Events](#events)
6. [Examples](#examples)
7. [Browser Support](#browser-support)
8. [License](#license)

**Installation**
---------------

```html
<script src="path/to/your/local/folder/phone-mask-min.js"></script>
```

**Usage**
-----

To use PhoneNumberMask, create a new instance and pass the input element or selector, and options (optional):

```javascript
const phoneNumberMask = new PhoneNumberMask('#phone-number', {
  masks: ['(##) #####-####'],
  messages: {
    'en': 'Please enter a valid phone number.',
  },
});
```

**Options**
----------

### masks

* Type: `string[]`
* Default: `['(##) #####-####']`
* Description: An array of phone number masks.

### messages

* Type: `object`
* Default: `{ 'en': 'Please enter a valid phone number.' }`
* Description: An object containing error messages for different languages.

**Methods**
----------

### `apply(selector, options)`

* Description: Applies PhoneNumberMask to multiple input elements.
* Parameters:

	+ `selector`: A CSS selector for the input elements.
	+ `options`: Options for PhoneNumberMask.

### `getLocalizedMessage()`

* Description: Returns the localized error message.
* Returns: `string`

### `getUnmaskedValue()`

* Description: Returns the unmasked phone number value.
* Returns: `string`

### `getValue()`

* Description: Returns the phone number value.
* Returns: `number|null`

### `setValue(value)`

* Description: Sets the phone number value.
* Parameters:

	+ `value`: The phone number value.

### `validateInput()`

* Description: Validates the phone number input.

**Events**
----------

### `input`

* Description: Fired when the input value changes.
* Parameters:

	+ `event`: The input event.

### `blur`

* Description: Fired when the input loses focus.
* Parameters:

	+ `event`: The blur event.

### `keydown`

* Description: Fired when a key is pressed.
* Parameters:

	+ `event`: The keydown event.

### `paste`

* Description: Fired when the user pastes text into the input.
* Parameters:

	+ `event`: The paste event.

**Examples**
-----------

### Basic Usage

```javascript
import PhoneNumberMask from 'phone-number-mask';

const phoneNumberMask = new PhoneNumberMask('#phone-number');
```

### Custom Masks

```javascript
import PhoneNumberMask from 'phone-number-mask';

const phoneNumberMask = new PhoneNumberMask('#phone-number', {
  masks: ['(##) #####-####', '(###) ###-####'],
});
```

### Custom Error Messages

```javascript
import PhoneNumberMask from 'phone-number-mask';

const phoneNumberMask = new PhoneNumberMask('#phone-number', {
  messages: {
    'en': 'Please enter a valid phone number.',
    'pt': 'Digite um número de telefone válido.',
  },
});
```

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const phoneMask = new PhoneNumberMask('#user_mobile', {
        masks: [
            "(##) #####-####", // 9 digits after area code (most common)
            "(##) ####-####"   // 8 digits after area code
        ],
        messages: {
        'en': 'Please enter a phone number in the format (XX) XXXXX-XXXX or (XX) XXXX-XXXX',
        'pt-BR': 'Por favor, digite um número de telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX',
        'es': 'Por favor, introduzca un número de teléfono en el formato (XX) XXXXX-XXXX o (XX) XXXX-XXXX'
    }
    });
});
```



**Browser Support**
-----------------

PhoneNumberMask supports modern browsers, including:

* Google Chrome
* Mozilla Firefox
* Safari
* Microsoft Edge

**License**
-------

PhoneNumberMask is licensed under the MIT License.
