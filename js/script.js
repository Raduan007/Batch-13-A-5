const issuesContainer = document.getElementById("issues");
const allBtn = document.getElementById("allBtn");
const openBtn = document.getElementById("openBtn");
const closedBtn = document.getElementById("closedBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const issueModal = document.getElementById("issueModal");
const modalContent = document.getElementById("modalContent");

const issueCount = document.getElementById("issueCount");
const openCountEl = document.getElementById("openCount");
const closedCountEl = document.getElementById("closedCount");

let allIssues = [];
let filteredIssues = [];
let activeTab = "all";

// Icons label
function getLabelIcon(label) {
  switch ((label || "").toLowerCase()) {
    case "bug": 
      return `<img src="./assets/BugDroid.png" class="w-3 h-3" alt="bug">`;
    case "enhancement": 
      return `<img src="./assets/Sparkle.png" class="w-3 h-3" alt="enhancement">`;
    case "documentation": 
      return `<img src="./assets/readme-brands-solid-full.svg" alt="" class="w-3 h-3">`;
    case "help wanted": 
      return `<img src="./assets/circle-question-solid-full.svg" alt="" class="w-3 h-3">`;
    default:     
      return `<img src="./assets/Lifebuoy.png" class="w-3 h-3" alt="default">`;
  }
}

// Fetch issues
async function fetchIssues() {
  try {
    const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
    const data = await res.json();
    allIssues = data.data || [];
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

  issueCount.textContent = `${issues.length} Issues`;
  openCountEl.textContent = `Open`;
  closedCountEl.textContent = `Closed`;

  issues.forEach(issue => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition";

    const borderColor = issue.status === "open" ? "#00A96E" : issue.status === "closed" ? "#A855F7" : "transparent";
    card.style.borderTop = `4px solid ${borderColor}`;

    const labelsHTML = (issue.labels || []).map(label =>
      `<span class="px-1.5 py-0.5 text-[9px] font-medium ${getLabelColor(label)} rounded-full flex items-center gap-1">
         <span>${getLabelIcon(label)}</span>${label.toUpperCase()}
       </span>`
    ).join(" ");

    card.innerHTML = `
      <div class="flex justify-between p-4">
        <img class="w-6 h-6" src="${issue.status === 'closed' ? './assets/Closed- Status .png' : './assets/Open-Status.png'}" alt="${issue.status}">
        <span class="px-2 py-0.5 text-xs font-semibold ${getPriorityColor(issue.priority)} rounded-full">${issue.priority ? issue.priority.toUpperCase() : "LOW"}</span>
      </div>
      <h3 class="text-lg font-semibold mt-2 pl-4">${issue.title}</h3>
      <p class="text-gray-500 text-sm mt-2 pl-4">${issue.description?.substring(0,50) || ""}...</p>
      <div class="flex gap-1 mt-2 pl-4">${labelsHTML}</div>
      <div class="flex justify-between text-xs p-3 text-[#64748B] mt-4 border-t border-[#E4E4E7]">
        <span>#${issue.id} by ${issue.author}</span>
        <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="flex justify-between text-xs p-3 text-[#64748B]">
        <span>Assignee: ${issue.assignee || "None"}</span>
        <span>${issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString() : "-"}</span>
      </div>
    `;

    card.addEventListener("click", () => showModal(issue));
    issuesContainer.appendChild(card);
  });
}

// Search API
async function searchIssues() {
  const query = searchInput.value.trim();
  if (!query) {
    if(activeTab === "all") renderIssues(allIssues);
    if(activeTab === "open") renderIssues(allIssues.filter(i => i.status==="open"));
    if(activeTab === "closed") renderIssues(allIssues.filter(i => i.status==="closed"));
    return;
  }
  try {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    let results = data.data || [];

    if(activeTab === "open") results = results.filter(i => i.status === "open");
    if(activeTab === "closed") results = results.filter(i => i.status === "closed");

    renderIssues(results);
  } catch (error) {
    issuesContainer.innerHTML = `<p class="text-red-500">Search failed.</p>`;
    console.error(error);
  }
}

searchBtn.addEventListener("click", searchIssues);
searchInput.addEventListener("keyup", (e) => { if(e.key === "Enter") searchIssues(); });

// Modal
function showModal(issue) {
  const labelsHTML = (issue.labels || []).map(label =>
    `<span class="px-1.5 py-0.5 text-[9px] font-medium ${getLabelColor(label)} rounded-full flex items-center gap-1">
       <span>${getLabelIcon(label)}</span>${label.toUpperCase()}
     </span>`
  ).join(" ");

  modalContent.innerHTML = `
 <h2 class="text-2xl font-bold mb-2">${issue.title}</h2>

<div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
  <span class="px-2 py-0.5 text-xs rounded-full ${issue.status === "open" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}">
    ${issue.status === "open" ? "Opened" : "Closed"}
  </span>
  <span>Opened by ${issue.author}</span>
  <span>•</span>
  <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
</div>

<div class="flex gap-2 mb-3 flex-wrap">
  ${labelsHTML}
</div>

<p class="text-gray-700 mb-4">
  ${issue.description}
</p>

<div class="grid grid-cols-2 gap-4 p-3 border- bg-[#F8FAFC]">
  <div>
    <p class="text-sm text-gray-500">Assignee:</p>
    <p class="font-semibold">${issue.assignee || "None"}</p>
  </div>

  <div>
    <p class="text-sm text-gray-500">Priority:</p>
    <span class="px-2 py-0.5 text-xs rounded-full ${getPriorityColor(issue.priority)}">
      ${(issue.priority || "LOW").toUpperCase()}
    </span>
  </div>
</div>

<div class="flex justify-end mt-6">
  <button id="closeModalBtn" class="bg-[#4A00FF] text-white px-4 py-2 rounded transition active:scale-95 ">
    Close
  </button>
</div>
  `;

  issueModal.classList.remove("hidden");

  const bottomCloseBtn = document.getElementById("closeModalBtn");
  bottomCloseBtn.addEventListener("click", () => {
    issueModal.classList.add("hidden");
  });
}

// Priority 
function getPriorityColor(priority) {
  switch((priority || "low").toLowerCase()) {
    case "high": return "text-red-600 bg-red-100";
    case "medium": return "text-yellow-600 bg-yellow-100";
    default: return "text-green-600 bg-green-100";
  }
}

// Label colors
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
allBtn.onclick = () => { activeTab="all"; renderIssues(allIssues); setActiveButton(allBtn); };
openBtn.onclick = () => { activeTab="open"; renderIssues(allIssues.filter(i => i.status==="open")); setActiveButton(openBtn); };
closedBtn.onclick = () => { activeTab="closed"; renderIssues(allIssues.filter(i => i.status==="closed")); setActiveButton(closedBtn); };

// Active button
function setActiveButton(activeBtn){
  [allBtn, openBtn, closedBtn].forEach(btn=>{
    btn.classList.remove("bg-[#4A00FF]","text-white");
    btn.classList.add("border","border-[#E4E4E7]","text-[#64748B]");
  });
  activeBtn.classList.add("bg-[#4A00FF]","text-white");
}

const input = document.getElementById("searchInput");
const icon = document.getElementById("searchIcon");

input.addEventListener("input", () => {
  if (input.value.length > 0) {
    icon.classList.add("hidden");
  } else {
    icon.classList.remove("hidden");
  }
});

fetchIssues();