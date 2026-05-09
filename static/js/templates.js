
    // --- SMART LAYOUT LOGIC ---
    window.onload = function() {
        const rawData = JSON.parse(localStorage.getItem('badmintonTournament'));
        if(!rawData) return;

        // 1. EXTRACT REAL TEAMS (Ignore BYEs)
        let realTeams = [];
        // We look at the Q1-Q4 inputs to find real names
        const check = (t) => { if(t && t.name !== "BYE") realTeams.push(t); };
        check(rawData.q1t1); check(rawData.q1t2);
        check(rawData.q2t1); check(rawData.q2t2);
        check(rawData.q3t1); check(rawData.q3t2);
        check(rawData.q4t1); check(rawData.q4t2);

        const teamCount = realTeams.length;

        // 2. DECIDE LAYOUT BASED ON COUNT
        if (teamCount <= 2) {
            // SCENARIO: 2 TEAMS -> SHOW FINAL ONLY
            document.getElementById('col-qf').classList.add('hidden-col');
            document.getElementById('col-sf').classList.add('hidden-col');
            
            // Inject straight into Final
            renderMatchContent('f1', realTeams[0], realTeams[1]);
        
        } else if (teamCount <= 4) {
            // SCENARIO: 3-4 TEAMS -> SHOW SEMIS & FINAL
            document.getElementById('col-qf').classList.add('hidden-col');
            
            // Fill Semis (T1 vs T2) and (T3 vs T4)
            // Note: If odd number (3), one might be a BYE, handled by filling empty
            renderMatchContent('s1', realTeams[0], realTeams[1] || {name:'BYE', player:'-'});
            renderMatchContent('s2', realTeams[2], realTeams[3] || {name:'BYE', player:'-'});
            
            // Init empty Final
            renderMatchContent('f1', {name:'Winner S1', player:''}, {name:'Winner S2', player:''});

        } else {
            // SCENARIO: 5-8 TEAMS -> FULL TREE
            // Standard Fill
            renderMatchContent('q1', rawData.q1t1, rawData.q1t2);
            renderMatchContent('q2', rawData.q2t1, rawData.q2t2);
            renderMatchContent('q3', rawData.q3t1, rawData.q3t2);
            renderMatchContent('q4', rawData.q4t1, rawData.q4t2);
            
            // Init Next Rounds
            renderMatchContent('s1', {name:'Winner Q1', player:''}, {name:'Winner Q2', player:''});
            renderMatchContent('s2', {name:'Winner Q3', player:''}, {name:'Winner Q4', player:''});
            renderMatchContent('f1', {name:'Winner S1', player:''}, {name:'Winner S2', player:''});
            
            // Auto-process BYEs for Full Tree
            autoAdvanceByes('q1', rawData.q1t1, rawData.q1t2, 's1', 1);
            autoAdvanceByes('q2', rawData.q2t1, rawData.q2t2, 's1', 2);
            autoAdvanceByes('q3', rawData.q3t1, rawData.q3t2, 's2', 1);
            autoAdvanceByes('q4', rawData.q4t1, rawData.q4t2, 's2', 2);
        }
    };

    // Helper: Creates the HTML inside the card
    function renderMatchContent(matchId, t1, t2) {
        const html = `
            <div class="d-flex justify-content-between align-items-center mb-2" id="${matchId}-team1">
                <div><div class="team-name">${t1.name}</div><div class="player-name">${t1.player}</div></div>
                <span class="score-badge">0</span>
            </div>
            ${matchId === 'f1' ? '<hr>' : ''}
            <div class="d-flex justify-content-between align-items-center mb-2" id="${matchId}-team2">
                <div><div class="team-name">${t2.name}</div><div class="player-name">${t2.player}</div></div>
                <span class="score-badge">0</span>
            </div>
        `;
        document.getElementById(`${matchId}-c`).innerHTML = html;
    }

    // Helper: Auto-Move if BYE exists (Only for Full Bracket Mode)
    function autoAdvanceByes(mid, t1, t2, nextMid, slotIdx) {
        if(t2.name === "BYE") {
            document.getElementById(`match-${mid}`).classList.add('hidden-col'); // Hide match
            // Move T1 to Next
            updateNextSlot(nextMid, slotIdx, t1.name);
        } else if(t1.name === "BYE") {
            document.getElementById(`match-${mid}`).classList.add('hidden-col');
            updateNextSlot(nextMid, slotIdx, t2.name);
        }
    }

    function updateNextSlot(mid, slotIdx, name) {
        let el = document.querySelector(`#match-${mid} #${mid}-team${slotIdx} .team-name`);
        if(el) el.innerText = name;
    }

    // --- SCORING LOGIC ---
    let currentMatch="", nextMatch="";
    function openModal(mid, nid) {
        currentMatch = mid; nextMatch = nid;
        let p1 = document.querySelector(`#${mid}-c #${mid}-team1 .team-name`).innerText;
        let p2 = document.querySelector(`#${mid}-c #${mid}-team2 .team-name`).innerText;
        document.getElementById('modal-p1-name').innerText = p1;
        document.getElementById('modal-p2-name').innerText = p2;
        document.querySelectorAll('input').forEach(i=>i.value='');
        new bootstrap.Modal(document.getElementById('scoreModal')).show();
    }

    async function saveScore() {
        let s1p1 = Number(document.getElementById('s1-p1').value), s1p2 = Number(document.getElementById('s1-p2').value);
        let s2p1 = Number(document.getElementById('s2-p1').value), s2p2 = Number(document.getElementById('s2-p2').value);
        let s3p1 = Number(document.getElementById('s3-p1').value), s3p2 = Number(document.getElementById('s3-p2').value);

        let p1S = 0, p2S = 0;
        if(s1p1>s1p2) p1S++; else if(s1p2>s1p1) p2S++;
        if(s2p1>s2p2) p1S++; else if(s2p2>s2p1) p2S++;
        if(s3p1>s3p2) p1S++; else if(s3p2>s3p1) p2S++;

        let p1 = document.getElementById('modal-p1-name').innerText;
        let p2 = document.getElementById('modal-p2-name').innerText;
        let winner = p1S > p2S ? p1 : p2;

        // Update UI
        let winId = p1S > p2S ? `${currentMatch}-team1` : `${currentMatch}-team2`;
        document.querySelector(`#${currentMatch}-c #${winId} .team-name`).classList.add('text-winner');
        document.querySelector(`#${currentMatch}-c #${currentMatch}-team1 .score-badge`).innerText = p1S;
        document.querySelector(`#${currentMatch}-c #${currentMatch}-team2 .score-badge`).innerText = p2S;

        if(nextMatch === 'winner') {
            document.getElementById('champion-name').innerText = winner;
        } else {
            // Determine logic: Q1/3 -> Slot 1, Q2/4 -> Slot 2
            let slot = (currentMatch==='q2'||currentMatch==='q4'||currentMatch==='s2') ? 2 : 1;
            updateNextSlot(nextMatch, slot, winner);
        }

        // Save DB
        await fetch('/api/save_match', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({p1:p1, p2:p2, winner:winner, score:`${p1S}-${p2S}`})
        });
        
        bootstrap.Modal.getInstance(document.getElementById('scoreModal')).hide();
       
    }
       
            async function flipCoin() {
            const response = await fetch('/api/toss');
            console.log("Tossing the coin...");
            const data = await response.json();
            console.log("Coin Toss Result:", data.result);
            
            
            alert("🪙 The Coin Shows: " + data.result);
    }
