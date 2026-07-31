# Address Validation Service Architecture

## Overview
`AddressValidationService` validates street addresses, verifies postal code formats across multiple countries (US, IN, UK, CA, AU), and returns sanitized address payloads for checkout.

## API Specification
```javascript
const service = new AddressValidationService();

const validation = service.validateAddress({
  street: '562 Wellington Road',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94101',
  country: 'US'
});
```

## Unit Test Suite
Tested via Vitest in `tests/unit/address-validation-service.test.js`.
