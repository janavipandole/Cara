// Interactive milestones tracking component
document.addEventListener("DOMContentLoaded", () => {
    const trackingBox = document.getElementById("order-tracking-timeline-target");
    if (!trackingBox) return;

    trackingBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin: 30px 0; font-family:sans-serif; position:relative;">
            <div style="position:absolute; top:12px; left:0; width:100%; height:4px; background:#ccc; z-index:1;"></div>
            <div id="timeline-bar" style="position:absolute; top:12px; left:0; width:50%; height:4px; background:#088178; z-index:2; transition:width 0.5s;"></div>
            
            <div class="timeline-step" style="z-index:3; text-align:center;">
                <div style="width:28px; height:28px; border-radius:50%; background:#088178; color:white; line-height:28px; margin:0 auto; font-weight:bold;">1</div>
                <p style="font-size:12px; margin-top:5px; font-weight:600;">Placed</p>
            </div>
            <div class="timeline-step" style="z-index:3; text-align:center;">
                <div style="width:28px; height:28px; border-radius:50%; background:#088178; color:white; line-height:28px; margin:0 auto; font-weight:bold;">2</div>
                <p style="font-size:12px; margin-top:5px; font-weight:600;">Processing</p>
            </div>
            <div class="timeline-step" style="z-index:3; text-align:center;">
                <div style="width:28px; height:28px; border-radius:50%; background:#ccc; color:white; line-height:28px; margin:0 auto; font-weight:bold;">3</div>
                <p style="font-size:12px; margin-top:5px; font-weight:600;">Shipped</p>
            </div>
            <div class="timeline-step" style="z-index:3; text-align:center;">
                <div style="width:28px; height:28px; border-radius:50%; background:#ccc; color:white; line-height:28px; margin:0 auto; font-weight:bold;">4</div>
                <p style="font-size:12px; margin-top:5px; font-weight:600;">Delivered</p>
            </div>
        </div>
    `;
});
