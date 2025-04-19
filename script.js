document.getElementById("save_tabs").addEventListener("click", async() => {
    const name = document.getElementById("collection_name").value.trim();
    if(!name) return alert("Enter a name!");

    const tabs = await chrome.tabs.query({currentWindow: true});
    const urls = tabs.map(tab => tab.url);

    chrome.storage.local.get("collections", (data) => {
        const collections = data.collections || {};
        collections[name] = urls;
        chrome.storage.local.set({collections});
        alert("Tabs Saved!");
        renderCollections();
    });
});

function renderCollections(){
    chrome.storage.local.get("collections", (data) => {
        const container = document.getElementById("collection_list");
        container.innerHTML = "";

        for(const[name, urls] of Object.entries(data.collections || {})){
            const div = document.createElement("div");
            div.className = "collection-item";
            
            // Use data attributes instead of inline JavaScript
            const encodedName = encodeURIComponent(name);
            
            div.innerHTML = `
                <strong>${name}</strong>
                <button class="open-tabs-btn" data-name="${encodedName}">Open Tabs</button>
                <button class="delete-collection-btn" data-name="${encodedName}">Delete Collection</button>
            `;
            
            container.appendChild(div);
        }
        
        // Add event listeners after adding elements to DOM
        addButtonEventListeners();
    });
}

function addButtonEventListeners() {
    // Add listeners for opening tabs
    document.querySelectorAll('.open-tabs-btn').forEach(button => {
        button.addEventListener('click', function() {
            const name = decodeURIComponent(this.getAttribute('data-name'));
            openTabs(name);
        });
    });
    
    // Add listeners for deleting collections
    document.querySelectorAll('.delete-collection-btn').forEach(button => {
        button.addEventListener('click', function() {
            const name = decodeURIComponent(this.getAttribute('data-name'));
            deleteCollection(name);
        });
    });
}

function openTabs(name) {
    chrome.storage.local.get("collections", (data) => {
        const urls = data.collections[name];
        if (urls && urls.length) {
            urls.forEach(url => chrome.tabs.create({ url }));
        }
    });
}

function deleteCollection(name) {
    chrome.storage.local.get("collections", (data) => {
        const collections = data.collections || {};
        delete collections[name];
        chrome.storage.local.set({ collections }, () => {
            console.log(`Deleted: ${name}`);
            renderCollections();
        });    
    });
}

document.addEventListener("DOMContentLoaded", renderCollections);