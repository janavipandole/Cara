Write-Host ""
Write-Host "========================================="
Write-Host "      CARA REPOSITORY ISSUE AUDITOR"
Write-Host "========================================="
Write-Host ""

# -----------------------------
# Issue 2501
# -----------------------------
Write-Host "==============================="
Write-Host "Issue #2501 : console.log"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.js |
Select-String "console.log"

# -----------------------------
# console.error
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "console.error"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.js |
Select-String "console.error"

# -----------------------------
# Issue 2502
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2502 : Input Elements"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<input"

# -----------------------------
# Labels
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Label Elements"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<label"

# -----------------------------
# Issue 2508
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2508 : Links"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<a "

# -----------------------------
# Issue 2509
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2509 : Images"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<img"

# -----------------------------
# Width=
# -----------------------------
Write-Host ""
Write-Host "Images With Width Attribute"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "width="

# -----------------------------
# Height=
# -----------------------------
Write-Host ""
Write-Host "Images With Height Attribute"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "height="

# -----------------------------
# Alt=
# -----------------------------
Write-Host ""
Write-Host "Images With Alt Attribute"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "alt="

# -----------------------------
# Issue 2507
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2507 : <i> Tags"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<i "

# -----------------------------
# Favicon
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2506 : Favicon"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "rel=""icon"""

# -----------------------------
# Footer
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Footer"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<footer"

# -----------------------------
# Duplicate Footer JS
# -----------------------------
Write-Host ""
Write-Host "Footer Script Includes"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.html |
Select-String "<script"

# -----------------------------
# CSS px Count
# -----------------------------
Write-Host ""
Write-Host "==============================="
Write-Host "Issue #2504 : px Usage"
Write-Host "==============================="

Get-ChildItem -Recurse -Include *.css |
Select-String "px"

Write-Host ""
Write-Host "========================================="
Write-Host "             AUDIT FINISHED"
Write-Host "========================================="