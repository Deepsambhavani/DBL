     let teamCount = 0;
        const MAX_TEAMS = 8;
        function addTeamInput() {
            if(teamCount >= MAX_TEAMS) {
                alert("Maximum 8 teams allowed for this bracket size!");
                return;
            }
            teamCount++;
            const container = document.getElementById('team-list-container');
            const div = document.createElement('div');
            div.className = "input-group mb-2 team-row-item";
            div.id = `team-row-${teamCount}`;
            div.innerHTML = `
                <span class="input-group-text  fw-bold">${teamCount}</span>
                <input type="text" class="form-control team-name" placeholder="Team Name">
                <input type="text" class="form-control player-name" placeholder="Player Name">
                <button class="btn btn-outline-danger" onclick="removeTeam(${teamCount})"><i class="fas fa-trash"></i></button>`;
            container.appendChild(div);
              updateCount();
        }
        function removeTeam(id) {
            const row = document.getElementById(`team-row-${id}`);
            row.remove();
            teamCount--;
            updateCount();
        }
        function updateCount() {
            document.getElementById('team-count-display').innerText = `Teams: ${document.querySelectorAll('.team-row-item').length} / 8`;
        }
        window.onload = function() {
            addTeamInput();
            addTeamInput();
        };
        function validateAndStart() {
            let teams = [];
            document.querySelectorAll('.team-row-item').forEach(row => {
                let tName = row.querySelector('.team-name').value.trim();
                let pName = row.querySelector('.player-name').value.trim();
                if(tName && pName) {
                    teams.push({ name: tName, player: pName });
                }
            });
           // Only look for inputs inside the team list, not the whole page
        const inputs = document.getElementById('team-list-container').querySelectorAll('.form-control');
        for (let input of inputs) {
            if (input.value.trim() === "") {
                alert("Please fill in all Team and Player names.");
            input.focus();
        return; 
            }
        }
            if (teams.length % 2 !== 0) {
            alert("Please add an even number of teams to start.");
          return;
    }
            teams.sort(() => Math.random() - 0.5);

            const bracketMap = {
                q1t1: teams[0], q1t2: teams[1],
                q2t1: teams[2], q2t2: teams[3],
                q3t1: teams[4], q3t2: teams[5],
                q4t1: teams[6], q4t2: teams[7]
            };
            localStorage.setItem('badmintonTournament', JSON.stringify(bracketMap));
            window.location.href = "/tournament";
        }



       

        function showSection(id) {
            document.querySelectorAll('.app-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            event.target.classList.add('active');
            if(id === 'history') loadHistory();
        }



        async function loadHistory() {
            const tbody = document.getElementById('history-table-body');
            const emptyMsg = document.getElementById('history-empty');
            const summary = document.getElementById('history-summary');
            const searchBar = document.getElementById('history-search-bar');
            try {
                const res = await fetch('/api/matches');
                const data = await res.json();
                window._historyData = data;
                renderHistoryRows(data);
                if (data.length > 0) {
                    document.getElementById('total-matches').innerText = data.length;
                    document.getElementById('latest-champ').innerText = data[0].winner;
                    summary.style.display = 'flex';
                    searchBar.style.display = 'block';
                    emptyMsg.style.display = 'none';
                    document.getElementById('history-main-table').style.display = '';
                } else {
                    emptyMsg.style.display = 'block';
                    document.getElementById('history-main-table').style.display = 'none';
                }
            } catch(e) { console.error(e); }
        }

        function renderHistoryRows(data) {
            const tbody = document.getElementById('history-table-body');
            if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4" style="color:#ccc;">No matches match your search.</td></tr>'; return; }
            let html = '';
            data.forEach((m, i) => {
                let runner = m.p1 === m.winner ? m.p2 : m.p1;
                let parts = m.score.split('-');
                let wS = parts[0] || '0', lS = parts[1] || '0';
                html += '<tr class="history-row">' +
                    '<td><span class="match-num">#' + (window._historyData.length - i) + '</span></td>' +
                    '<td><span class="match-date">' + m.date + '</span></td>' +
                    '<td><span class="winner-cell"><span class="trophy-icon">trophy</span>' + m.winner + '</span></td>' +
                    '<td><span class="runner-cell">' + runner + '</span></td>' +
                    '<td><span class="score-pill score-w">' + wS + '</span> <span class="score-sep">-</span> <span class="score-pill score-l">' + lS + '</span></td>' +
                    '<td><span class="result-badge">Completed</span></td>' +
                    '</tr>';
            });
            tbody.innerHTML = html;
        }

        function filterHistory() {
            const q = document.getElementById('history-filter').value.trim().toLowerCase();
            if (!q) { renderHistoryRows(window._historyData); return; }
            const filtered = (window._historyData || []).filter(m =>
                m.p1.toLowerCase().includes(q) || m.p2.toLowerCase().includes(q) || m.winner.toLowerCase().includes(q)
            );
            renderHistoryRows(filtered);
        }