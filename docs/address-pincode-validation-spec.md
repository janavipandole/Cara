# Address & Pincode Serviceability Specification

## Overview
The `PincodeValidationEngine` validates international postal code formats (IN, US, UK, CA) during checkout and provides dynamic shipping velocity predictions based on regional postal zone mapping.

## Supported Regional Formats
- **India (IN):** 6 digits, non-zero starting digit (`^[1-9][0-9]{5}$`).
- **United States (US):** 5 digits or ZIP+4 (`^\d{5}(-\d{4})?$`).
- **United Kingdom (UK):** Alphanumeric outward & inward code.
- **Canada (CA):** Alternating Letter-Digit-Letter format.

## API Reference
- `validatePostalCode(code, countryCode)`: Validates format correctness.
- `estimateDeliveryDays(code, countryCode)`: Computes ETA timeline and delivery zone tier.
