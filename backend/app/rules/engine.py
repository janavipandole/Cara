def filter_by_rules(base_product, candidates):
    """
    Applies strict business logic rules.
    - Rule 1: No self-recommendations.
    - Rule 2: Outfit Completeness (Top -> Bottom, Bottom -> Top).
    - Rule 3: Category Compatibility (Formal strictly with Formal).
    - Rule 4: Color Harmony (Avoid clashing colors).
    - Rule 5: Pattern Matching (Avoid mixing two heavy patterns).
    """
    valid_candidates = []
    
    clashing_colors = {
        "red": ["pink", "orange", "green"],
        "navy": ["black", "brown"],
        "black": ["navy", "brown"],
        "brown": ["black", "navy"]
    }
    
    pattern_styles = ["floral", "pattern", "print", "stripe"]
    
    for c in candidates:
        # Rule 1: Don't recommend the exact same product
        if c.id == base_product.id:
            continue
            
        # Rule 2: Don't recommend another top if base is a top (we want a full outfit)
        if base_product.subcategory and c.subcategory and base_product.subcategory == c.subcategory:
            continue
            
        # Rule 3: Style/Category matching logic
        if base_product.category != c.category:
            if base_product.category == "formal" or c.category == "formal":
                continue # Strictly block formal mixed with non-formal
                
        # Rule 4: Color Harmony
        if base_product.color and c.color:
            base_color = base_product.color.lower()
            cand_color = c.color.lower()
            if base_color in clashing_colors and cand_color in clashing_colors[base_color]:
                continue
                
        # Rule 5: Pattern Clashing (Don't mix two different patterns)
        if base_product.style and c.style:
            base_pattern = base_product.style.lower() in pattern_styles
            cand_pattern = c.style.lower() in pattern_styles
             if (
    base_pattern
    and cand_pattern
    and base_product.style.lower() != c.style.lower()
):
    continue# Too busy!
                
        valid_candidates.append(c)
        
    return valid_candidates
