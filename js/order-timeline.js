document.addEventListener("DOMContentLoaded", () => {
    const trackingBox = document.getElementById("order-tracking-timeline-target");
    if (!trackingBox) return;

    let stageIndex = 1; // Start at 'Confirmed'/'Processing' (index 1)
    
    function renderTimeline() {
        let simulator = null;
        let stages = ['Placed', 'Processing', 'Shipped', 'Delivered'];
        let baseTime = new Date();

        if (typeof window.TrackerTimelineSimulator === 'function') {
            simulator = new window.TrackerTimelineSimulator();
            // Map the stages
            stages = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
        }

        const totalStages = stages.length;
        const percent = Math.min(100, Math.max(0, (stageIndex / (totalStages - 1)) * 100));

        let html = `
            <div style="display:flex; justify-content:space-between; margin: 30px 0; font-family:sans-serif; position:relative;">
                <div style="position:absolute; top:12px; left:0; width:100%; height:4px; background:#ccc; z-index:1;"></div>
                <div id="timeline-bar" style="position:absolute; top:12px; left:0; width:${percent}%; height:4px; background:#088178; z-index:2; transition:width 0.5s;"></div>
        `;

        stages.forEach((stage, idx) => {
            const isActive = idx <= stageIndex;
            const bg = isActive ? '#088178' : '#ccc';
            const color = 'white';
            const timeStr = isActive ? (simulator ? simulator.getSimulatedTimestamp(idx, baseTime) : new Date().toLocaleTimeString()) : '';
            
            html += `
                <div class="timeline-step" style="z-index:3; text-align:center;">
                    <div style="width:28px; height:28px; border-radius:50%; background:${bg}; color:${color}; line-height:28px; margin:0 auto; font-weight:bold;">${idx + 1}</div>
                    <p style="font-size:12px; margin-top:5px; font-weight:600;">${stage}</p>
                    <p class="timeline-time" style="font-size:10px; color:#777; margin-top:2px;">${timeStr}</p>
                </div>
            `;
        });

        html += `</div>`;
        trackingBox.innerHTML = html;
    }

    renderTimeline();

    // Expose progression control for simulation testing
    window.progressSimulatedTimeline = function() {
        stageIndex = (stageIndex + 1) % 4;
        renderTimeline();
    };
});
