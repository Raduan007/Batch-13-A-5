const issuesContainer = document.getElementById("issues");
const allBtn = document.getElementById("allBtn");
const openBtn = document.getElementById("openBtn");
const closedBtn = document.getElementById("closedBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const issueModal = document.getElementById("issueModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const issueCount = document.getElementById("issueCount");
const openCountEl = document.getElementById("openCount");
const closedCountEl = document.getElementById("closedCount");

let allIssues = [];
let filteredIssues = [];

// Fetch issues
async function fetchIssues() {
  try {
    const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
    const data = await res.json();
    allIssues = data.data;
    filteredIssues = [...allIssues];
    renderIssues(filteredIssues);
    setActiveButton(allBtn);
  } catch (error) {
    issuesContainer.innerHTML = `<p class="text-red-500">Failed to load issues.</p>`;
    console.error(error);
  }
}

// Render cards
function renderIssues(issues) {
  issuesContainer.innerHTML = "";

  // ✅ Dynamic counts
  const openIssues = issues.filter(i => i.status === "open").length;
  const closedIssues = issues.filter(i => i.status === "closed").length;

  issueCount.textContent = `${issues.length} Issues`;
  openCountEl.textContent = `Open`;
  closedCountEl.textContent = `Closed`;

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition";

    // ✅ Labels with color
    const labelsHTML = (issue.labels || []).map(label =>
      `<span class="px-3 py-1 text-xs font-medium ${getLabelColor(label)} rounded-full">${label.toUpperCase()}</span>`
    ).join(" ");

    card.innerHTML = `
      <div class="flex justify-between p-4">
        <img class="w-6 h-6" src="./assets/Open-Status.png">
        <span class="px-3 py-1 text-sm font-semibold ${getPriorityColor(issue.priority)} rounded-full">${issue.priority ? issue.priority.toUpperCase() : "LOW"}</span>
      </div>
      <h3 class="text-lg font-semibold mt-2 pl-4">${issue.title}</h3>
      <p class="text-gray-500 text-sm mt-2 pl-4">${issue.description?.substring(0,50) || ""}...</p>
      <div class="flex gap-2 mt-4 pl-4">${labelsHTML}</div>
      <div class="flex justify-between text-xs p-3 text-[#64748B] mt-4 border-t border-[#E4E4E7]">
        <span>#${issue.id} by ${issue.author}</span>
        <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="flex justify-between text-xs p-3 text-[#64748B]">
        <span>Assignee: ${issue.assignee || "None"}</span>
        <span>${issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}</span>
      </div>
    `;

    card.addEventListener("click", () => showModal(issue));
    issuesContainer.appendChild(card);
  });
}

// Search functionality
function searchIssues() {
  const query = searchInput.value.toLowerCase();
  filteredIssues = allIssues.filter(issue =>
    issue.title.toLowerCase().includes(query) ||
    issue.description.toLowerCase().includes(query) ||
    issue.author.toLowerCase().includes(query) ||
    (issue.assignee && issue.assignee.toLowerCase().includes(query))
  );
  renderIssues(filteredIssues);
}

searchBtn.addEventListener("click", searchIssues);
searchInput.addEventListener("keyup", (e) => { if(e.key === "Enter") searchIssues(); });

// Show modal
function showModal(issue) {
  const labelsHTML = (issue.labels || []).map(label =>
    `<span class="px-3 py-1 text-xs font-medium ${getLabelColor(label)} rounded-full">${label.toUpperCase()}</span>`
  ).join(" ");

  modalContent.innerHTML = `
    <h2 class="text-2xl font-bold mb-3">${issue.title}</h2>
    <p class="text-gray-700 mb-3">${issue.description}</p>
    <div class="flex gap-2 mb-3">${labelsHTML}</div>
    <p><strong>Priority:</strong> ${issue.priority}</p>
    <p><strong>Status:</strong> ${issue.status}</p>
    <p><strong>Author:</strong> ${issue.author}</p>
    <p><strong>Assignee:</strong> ${issue.assignee || "None"}</p>
    <p><strong>Created:</strong> ${new Date(issue.createdAt).toLocaleDateString()}</p>
    <p><strong>Due:</strong> ${issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}</p>
  `;
  issueModal.classList.remove("hidden");
}

// Close modal
closeModal.addEventListener("click", () => issueModal.classList.add("hidden"));

// Priority colors
function getPriorityColor(priority) {
  switch((priority || "low").toLowerCase()) {
    case "high": return "text-red-600 bg-red-100";
    case "medium": return "text-yellow-600 bg-yellow-100";
    default: return "text-green-600 bg-green-100"; // low
  }
}

//Label colors
function getLabelColor(label) {
  switch((label || "").toLowerCase()) {
    case "bug": return "text-red-600 bg-red-100";
    case "enhancement": return "text-green-600 bg-green-100";
    case "help wanted": return "text-yellow-700 bg-yellow-100";
    case "documentation": return "text-blue-600 bg-blue-100";
    default: return "text-gray-600 bg-gray-100";
  }
}

// Filters
allBtn.onclick = () => { renderIssues(allIssues); setActiveButton(allBtn); };
openBtn.onclick = () => { renderIssues(allIssues.filter(i => i.status==="open")); setActiveButton(openBtn); };
closedBtn.onclick = () => { renderIssues(allIssues.filter(i => i.status==="closed")); setActiveButton(closedBtn); };

// Active button 
function setActiveButton(activeBtn){
  [allBtn, openBtn, closedBtn].forEach(btn=>{
    btn.classList.remove("bg-[#4A00FF]","text-white");
    btn.classList.add("border","border-[#E4E4E7]","text-[#64748B]");
  });
  activeBtn.classList.add("bg-[#4A00FF]","text-white");
}


fetchIssues();