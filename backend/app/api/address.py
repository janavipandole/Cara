"""
Mock Address Autocomplete API.

Provides suggestions for address autocompletion in checkout.html
"""
from fastapi import APIRouter, Query
from typing import List, Dict

router = APIRouter()

# Static database of address suggestions for Indian addresses
ADDRESS_DATABASE = [
    {"street": "12/A MG Road", "city": "Mumbai", "zip": "400001"},
    {"street": "24 Park Street", "city": "Kolkata", "zip": "700016"},
    {"street": "105 Connaught Place", "city": "New Delhi", "zip": "110001"},
    {"street": "88 Brigade Road", "city": "Bengaluru", "zip": "560001"},
    {"street": "17 Nungambakkam High Road", "city": "Chennai", "zip": "600034"},
    {"street": "52-A Jubilee Hills", "city": "Hyderabad", "zip": "500033"},
    {"street": "301 Fergusson College Road", "city": "Pune", "zip": "411004"},
    {"street": "14/B SG Highway", "city": "Ahmedabad", "zip": "380054"},
    {"street": "9 Mall Road", "city": "Shimla", "zip": "171001"},
    {"street": "77 Hazratganj", "city": "Lucknow", "zip": "226001"},
]

@router.get("/suggest")
def get_address_suggestions(
    q: str = Query(..., min_length=1, description="Keyword search term for street/city")
) -> List[Dict[str, str]]:
    """Return matching address suggestions from the database."""
    query = q.strip().lower()
    matches = []

    for addr in ADDRESS_DATABASE:
        if query in addr["street"].lower() or query in addr["city"].lower():
            matches.append(addr)

    return matches[:5]
