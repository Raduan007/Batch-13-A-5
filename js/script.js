const issuesContainer = document.getElementById("issues");
let allIssues = [];
let filteredIssue  = [];


async function fetchIssues() {
  try {
    const res = await fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues");
    const data = await res.json();


    // allIssues = data.data || data.data.issues || [];
console.log(data);
    issuesContainer.innerHTML = "";

    allIssues.forEach(issue => {
      const labelsHTML = (issue.labels || [])
        .map(label => `<span class="px-3 py-1 text-xs bg-gray-100 rounded-full">${label}</span>`)
        .join(" ");

      const card = document.createElement("div");
      card.className = "bg-white rounded-xl shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition p-4";

      card.innerHTML = `
        <div class="flex justify-between mb-2">
          <img class="w-6 h-6" src="./assets/Open-Status.png">
          <span class="px-3 py-1 text-sm bg-gray-100 rounded-full">${issue.priority || "low"}</span>
        </div>
        <h3 class="text-lg font-semibold mb-1">${issue.title}</h3>
        <p class="text-gray-500 text-sm mb-2">${issue.description?.substring(0,50) || ""}...</p>
        <div class="flex gap-2">${labelsHTML}</div>
        <div class="flex justify-between text-xs text-[#64748B] mt-4 border-t border-[#E4E4E7] pt-2">
          <span>#${issue.id} by ${issue.author}</span>
          <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
      `;

      issuesContainer.appendChild(card);
    });

  } catch (error) {
    console.error("API error:", error);
    issuesContainer.innerHTML = `<p class="text-red-500">Failed to load issues.</p>`;
  }
}

fetchIssues();