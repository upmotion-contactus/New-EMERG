"""Industry configuration for lead scraper - VERY STRICT Business-Only Filtering"""
import re

# Business name patterns that MUST be present in the name itself
BUSINESS_NAME_REQUIRED = [
    r'\bllc\b',
    r'\binc\.?\b', 
    r'\bcorp\.?\b',
    r'\bco\.?\b',
    r'\bservices?\b',
    r'\bcompany\b',
    r'\benterprises?\b',
    r'\bsolutions?\b',
    r'\bcontractors?\b',
    r'\belectric(?:al)?\b',
    r'\bplumbing\b',
    r'\bhvac\b',
    r'\broofing\b',
    r'\bpainting\b',
    r'\blandscaping\b',
    r'\bconstruction\b',
    r'\b&\s*sons?\b',
    r'\bbrothers\b',
    r'\bpros?\b$',  # Ends with Pro/Pros
    r'\bgroup\b',
    r'\binspections?\b',
    r'\brepairs?\b',
    r'\binstall(?:ation|ers?)?\b',
]

INDUSTRIES = {
    "plumbing": {"keywords": ["plumb", "rooter", "drain", "sewer", "septic"]},
    "hvac": {"keywords": ["hvac", "heating", "cooling", "air condition", "furnace"]},
    "electrical": {"keywords": ["electric", "wiring", "panel", "circuit"]},
    "remodeling": {"keywords": ["remodel", "renovation", "construction", "contractor"]},
    "landscaping": {"keywords": ["landscap", "lawn", "tree service", "yard"]},
    "power_washing": {"keywords": ["power wash", "pressure wash", "soft wash"]},
    "roofing": {"keywords": ["roof", "shingle", "gutter"]},
    "painting": {"keywords": ["paint", "stain", "finish"]},
}

def get_all_industries():
    return list(INDUSTRIES.keys())

def detect_industry(text: str) -> str:
    text_lower = text.lower()
    for industry, config in INDUSTRIES.items():
        for keyword in config["keywords"]:
            if keyword in text_lower:
                return industry
    return "electrical"

def matches_industry(text: str, industry: str) -> bool:
    if industry not in INDUSTRIES:
        return False
    text_lower = text.lower()
    for keyword in INDUSTRIES[industry]["keywords"]:
        if keyword in text_lower:
            return True
    return False

def is_business_name(name: str) -> bool:
    """
    STRICT check - the NAME itself must look like a business name.
    Examples that PASS: "Alpi Electric LLC", "R Electrical Solutions", "1st Electric Response Inc."
    Examples that FAIL: "Robert Renfro", "Mike Gonzales", "David Guerra"
    """
    name_lower = name.lower().strip()
    
    # Check if name matches any business pattern
    for pattern in BUSINESS_NAME_REQUIRED:
        if re.search(pattern, name_lower):
            return True
    
    return False

def is_qualified_prospect(text: str, industry: str) -> bool:
    """
    VERY STRICT: Only qualifies if the NAME looks like a business.
    We're looking for business PAGE names, not personal profiles.
    
    The name must contain business indicators like:
    - LLC, Inc, Corp, Co
    - Services, Solutions, Company
    - Industry keywords (Electric, Plumbing, etc.)
    - Contractor, Construction, etc.
    """
    # Split text to get name (first part before context)
    lines = text.strip().split('\n')
    name = lines[0] if lines else text
    
    # The NAME itself must look like a business
    return is_business_name(name)
