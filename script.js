        let charts = {}; 

        async function fetchLeaderboard() {
            const loadingText = document.querySelector('.loading');
            loadingText.textContent = "Fetching latest votes...";

            try {
                const response = await fetch("https://script.google.com/macros/s/AKfycbwRbWdas6k6ebPgzH3MynOzRoj_6-rL3utGEmT-FW3dK176lFQKppzrz2yGgiYwzh3hbA/exec");
                const data = await response.json();

                if (!data || data.length === 0) {
                    loadingText.textContent = "No data available.";
                    return;
                }

                data.forEach(entry => {
                    let position = entry.position;
                    let candidates = entry.candidates.map(c => c.candidate);
                    let votes = entry.candidates.map(c => c.votes);

                    if (!charts[position]) {
                        const ctx = document.getElementById(`chart-${position.replace(/\s+/g, "-")}`).getContext('2d');
                        charts[position] = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: candidates,
                                datasets: [{
                                    label: 'Votes',
                                    data: votes,
                                    backgroundColor: ['#1F4E79', '#2E75B6', '#5B9BD5', '#9DC3E6', '#BDD7EE'],
                                    borderColor: '#1F4E79',
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                    duration: 1000,
                                    easing: 'easeInOutQuad'
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return `${context.label}: ${context.raw} votes`;
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            font: { weight: 'bold' },
                                            precision: 0
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            font: { weight: 'bold' }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        charts[position].data.labels = candidates;
                        charts[position].data.datasets[0].data = votes;
                        charts[position].update();
                    }
                });

                updatePrintableContent();
                loadingText.textContent = "Leaderboard updated";

            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
                loadingText.textContent = "Error fetching data!";
            }
        }

        function updatePrintableContent() {
            const printContent = document.getElementById('printContent');
            let html = '';
            
            Object.keys(charts).forEach(position => {
                html += `<div class="print-position">
                    <strong>Position: ${position}</strong>`;
                
                const candidates = charts[position].data.labels
                    .map((label, index) => ({
                        name: label,
                        votes: charts[position].data.datasets[0].data[index]
                    }))
                    .sort((a, b) => b.votes - a.votes);
                
                candidates.forEach(candidate => {
                    html += `<div style="margin-left: 20px;">- ${candidate.name}: ${candidate.votes} votes</div>`;
                });
                
                html += `</div>`;
            });
            
            printContent.innerHTML = html;
        }

        function handlePrint() {
            updatePrintableContent(); // Ensure content is updated
            const printableReport = document.getElementById('printable-report');
            printableReport.style.display = 'block'; // Make it visible
            window.print();
            printableReport.style.display = 'none'; // Hide it again after printing
        }

        function showSummary() {
            const modal = document.getElementById('summaryModal');
            const summaryData = document.getElementById('summaryData');
            modal.style.display = 'block';
            
            let html = '';
            Object.keys(charts).forEach(position => {
                const chart = charts[position];
                html += `<h4>${position}</h4>`;
                html += `<table class="summary-table">`;
                html += `<tr><th>Candidate</th><th>Votes</th></tr>`;
                
                const candidates = chart.data.labels
                    .map((label, index) => ({
                        name: label,
                        votes: chart.data.datasets[0].data[index]
                    }))
                    .sort((a, b) => b.votes - a.votes);
                
                candidates.forEach(candidate => {
                    html += `<tr>
                        <td>${candidate.name}</td>
                        <td>${candidate.votes}</td>
                    </tr>`;
                });
                
                html += `</table>`;
            });
            
            summaryData.innerHTML = html;
        }

        function closeSummary() {
            document.getElementById('summaryModal').style.display = 'none';
        }

        window.onclick = function(event) {
            const modal = document.getElementById('summaryModal');
            if (event.target == modal) {
                closeSummary();
            }
        }

        document.addEventListener("contextmenu", event => event.preventDefault());

        document.addEventListener("keydown", event => {
            if (event.ctrlKey && (event.key === "u" || event.key === "s" || event.key === "i" || event.key === "j" || event.key === "c")) {
                event.preventDefault();
            }
        });

        fetchLeaderboard();
        setInterval(fetchLeaderboard, 10000);
   