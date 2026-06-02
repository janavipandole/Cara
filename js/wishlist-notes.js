// Wishlist Notes & Priority Tags Manager
document.addEventListener("DOMContentLoaded", () => {
    // Wait and listen for wishlist dynamic rendering or item rows
    const observer = new MutationObserver(() => {
        const rows = document.querySelectorAll(".wishlist-card");
        rows.forEach(row => {
            if (row.querySelector(".wishlist-note-wrapper")) return;

            const itemId = row.dataset.id || row.id || Math.random().toString();
            
            const wrapper = document.createElement("div");
            wrapper.className = "wishlist-note-wrapper";
            wrapper.style.cssText = "margin-top: 10px; display: flex; flex-direction: column; gap: 6px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 6px;";
            
            // Get saved priority
            const savedPriority = localStorage.getItem(`cara_wishlist_priority_${itemId}`) || "Medium";
            const savedNote = localStorage.getItem(`cara_wishlist_note_${itemId}`) || "";

            wrapper.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <label style="font-size:11px; font-weight:700;">Priority:</label>
                    <select class="wishlist-priority" style="font-size:11px; padding:2px; border-radius:4px; border:1px solid #ccc;">
                        <option ${savedPriority==='High'?'selected':''}>High</option>
                        <option ${savedPriority==='Medium'?'selected':''}>Medium</option>
                        <option ${savedPriority==='Low'?'selected':''}>Low</option>
                    </select>
                </div>
                <input type="text" class="wishlist-note" placeholder="Add a personal note..." value="${savedNote}" style="font-size:11px; padding:4px; border:1px solid #ccc; border-radius:4px;" />
            `;

            row.appendChild(wrapper);

            // Change listeners
            wrapper.querySelector(".wishlist-priority").addEventListener("change", (e) => {
                localStorage.setItem(`cara_wishlist_priority_${itemId}`, e.target.value);
            });
            wrapper.querySelector(".wishlist-note").addEventListener("input", (e) => {
                localStorage.setItem(`cara_wishlist_note_${itemId}`, e.target.value);
            });
        });
    });

    const targetContainer = document.getElementById("wishlistContainer") || document.body;
    observer.observe(targetContainer, { childList: true, subtree: true });
});
