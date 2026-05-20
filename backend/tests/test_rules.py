import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.rules.engine import filter_by_rules

class MockProduct:
    def __init__(self, id, category, subcategory, color, style):
        self.id = id
        self.category = category
        self.subcategory = subcategory
        self.color = color
        self.style = style

def run_tests():
    print("Running Rule Engine Tests...")
    
    # Base: Formal Top
    base = MockProduct(1, "formal", "top", "navy", "classic")
    
    candidates = [
        MockProduct(1, "formal", "top", "navy", "classic"), # Should be filtered (self)
        MockProduct(2, "formal", "top", "white", "classic"), # Should be filtered (same subcategory)
        MockProduct(3, "street", "bottom", "black", "casual"), # Should be filtered (formal mixed with street)
        MockProduct(4, "formal", "bottom", "black", "classic"), # Should be filtered (clashing colors: navy and black)
        MockProduct(5, "formal", "bottom", "grey", "classic") # Valid
    ]
    
    results = filter_by_rules(base, candidates)
    
    assert len(results) == 1
    assert results[0].id == 5
    print("Test 1 Passed: Formal Rules and Color Clashing applied correctly.")
    
    # Base: Patterned Top
    base2 = MockProduct(10, "street", "top", "red", "floral")
    
    candidates2 = [
        MockProduct(11, "street", "bottom", "pink", "casual"), # Should be filtered (color clash: red and pink)
        MockProduct(12, "minimal", "bottom", "black", "stripe"), # Should be filtered (pattern clash: floral and stripe)
        MockProduct(13, "minimal", "bottom", "beige", "casual") # Valid
    ]
    
    results2 = filter_by_rules(base2, candidates2)
    assert len(results2) == 1
    assert results2[0].id == 13
    print("Test 2 Passed: Pattern and Color Clashing applied correctly.")
    
    print("All edge case tests passed successfully!")

if __name__ == "__main__":
    run_tests()
