document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  const connectBtn = document.getElementById("connectBtn");
  const userArea   = document.getElementById("userArea");
  const userMenu   = document.getElementById("userMenu");
  const addrShort  = document.getElementById("addrShort");
  const addrFull   = document.getElementById("addrFull");

  

  const currentAddress = "0x7b1f3c8a4E12B9A2cC40C2A5Bf0F1d9A0dE8C001";

  function shortAddr(a){ return a ? a.slice(0,6) + "…" + a.slice(-4) : "0x…"; }

  function setConnectedUI(address){
    addrShort.textContent = shortAddr(address);
    addrFull.textContent  = address;
    connectBtn?.classList.add("hidden");
    userArea.classList.remove("hidden");
  }

  function setDisconnectedUI(){
    userArea.classList.add("hidden");
    userArea.classList.remove("open");
    userMenu.setAttribute("aria-hidden","true");
    connectBtn?.classList.remove("hidden");
  }

  // Connect
  connectBtn?.addEventListener("click", () => setConnectedUI(currentAddress));

  // Toggle panel
  userArea.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !userArea.classList.contains("open");
    document.querySelectorAll(".user-area.open").forEach(el => {
      el.classList.remove("open");
      el.querySelector(".user-menu")?.setAttribute("aria-hidden","true");
    });
    if (willOpen) {
      userArea.classList.add("open");
      userMenu.setAttribute("aria-hidden","false");
    }
  });

  // Dışarı tıkla kapat
  document.addEventListener("click", () => {
    if (userArea.classList.contains("open")) {
      userArea.classList.remove("open");
      userMenu.setAttribute("aria-hidden","true");
    }
  });

  // Menü aksiyonları - logout dahil
userMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".menu-item");
  if (!item) return;

  const action = item.dataset.action;

  if (action === "logout") {
     setDisconnectedUI();                 // UI başlangıca dönsün
  userArea.classList.remove("open");
  userMenu.setAttribute("aria-hidden","true");
  connectBtn?.focus();

  // Ana sayfaya dön
  location.hash = "";                  // hash'i temizle
  if (typeof handleRoute === "function") handleRoute();  // varsa router'ı hemen çalıştır

  return;
  }

  if (action === "copy") {
    navigator.clipboard.writeText(addrFull.textContent).then(() => {
      item.textContent = "Copied";
      setTimeout(() => (item.textContent = "Copy Address"), 1200);
    });
    return;
  }

  if (action === "profile")   window.location.hash = "#profile";
  if (action === "activity")  window.location.hash = "#activity";
  if (action === "settings")  window.location.hash = "#settings";
  if (action === "support")   window.location.hash = "#help-center";
});


  // // Dev mode - sayfa açılınca bağlı görün
  // if (document.body.classList.contains("dev-mode")) {
  //   setConnectedUI("0xDEV1234567890");
  // } else {
  //   setDisconnectedUI();
  // }

  // Prod varsayılanı. Sayfa açıldığında panel gizli başlasın
setDisconnectedUI();



/* === Basit router: profil aç/kapa === */
const sectionsToHide = ["hero", "trade", "rent", "history", "docs", "help-center"];
const profileView = document.getElementById("profile");

function showHome() {
  profileView?.classList.add("hidden");
  sectionsToHide.forEach(id => document.getElementById(id)?.classList.remove("hidden"));
}

function showProfile() {
  sectionsToHide.forEach(id => document.getElementById(id)?.classList.add("hidden"));
  profileView?.classList.remove("hidden");
  // cüzdan adresini header'a yaz
  const pfAddrEl = document.getElementById("pfAddr");
  if (pfAddrEl) pfAddrEl.textContent = addrFull.textContent || "0x…";
}

function handleRoute() {
  if (location.hash === "#profile") showProfile();
  else showHome();
}
window.addEventListener("hashchange", handleRoute);
handleRoute();

/* === Profile tabs === */
const pfTabs = document.getElementById("pfTabs");
const pfPanels = document.querySelectorAll(".pf-panel");

function showProfilePanel(key) {
  pfPanels.forEach(p => p.classList.toggle("hidden", p.dataset.panel !== key));
  pfTabs?.querySelectorAll(".pf-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === key);
  });
  if (key === "active-games") renderActiveGames();
}

pfTabs?.addEventListener("click", (e) => {
  const btn = e.target.closest(".pf-tab");
  if (!btn) return;
  showProfilePanel(btn.dataset.tab);
});

/* === Active Games: veri ve render === */
const activeGames = [
  { id: "foundry", title: "Foundry",       image: "images/foundry.jpg", hours: 12.4, renewsIn: "12 days" },
  { id: "puffin",   title: "Puffin Raiders", image: "images/puffin.jpg",   hours: 5.1,  renewsIn: "7 days"  }
];

function renderActiveGames() {
  const grid = document.getElementById("pfGamesGrid");
  if (!grid) return;
  grid.innerHTML = activeGames.map(g => `
    <div class="game-card">
      <div class="game-thumb" style="background-image:url('${g.image}');">
        <span class="ribbon">Active</span>
        <button class="btn-play" data-id="${g.id}">Play</button>
      </div>
      <div class="game-body">
        <div class="game-title">${g.title}</div>
        <div class="game-meta">${g.hours} h played • renews in ${g.renewsIn}</div>
      </div>
    </div>
  `).join("");
}

// Play butonu demo
document.getElementById("pfGamesGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-play");
  if (!btn) return;
  alert("Launching " + btn.dataset.id);
});

/* ==== RENT – örnek veriler + render ==== */
const RENT_LISTINGS = [
  {
    id: "aao-badge",
    title: "AAO Badge",
    game: "Foundry",
    image: "images/foundry.jpg",
    priceDay: 0.25, // SUI/day
    duration: "3–7d",
    owner: "0x7b1f...C001",
    available: true
  },
  {
    id: "vortex-blade",
    title: "Vortex Blade +9",
    game: "Puffin Raiders",
    image: "images/puffin.jpg",
    priceDay: 0.18,
    duration: "1–3d",
    owner: "0x91a5...9F12",
    available: true
  },
  {
    id: "neon-frame",
    title: "Neon Frame",
    game: "Suicide Loop",
    image: "images/suicide-loop.jpg",
    priceDay: 0.12,
    duration: "7–14d",
    owner: "0x3de4...A7b9",
    available: false
  }
];

function fillRentGameFilter(){
  const sel = document.getElementById("rentGameFilter");
  if (!sel) return;
  const games = Array.from(new Set(RENT_LISTINGS.map(x => x.game)));
  games.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g; opt.textContent = g;
    sel.appendChild(opt);
  });
}

function renderRentGrid(){
  const grid = document.getElementById("rentGrid");
  const q = (document.getElementById("rentSearch")?.value || "").toLowerCase();
  const game = document.getElementById("rentGameFilter")?.value || "";

  const data = RENT_LISTINGS.filter(x => {
    const matchesQ = !q || (x.title.toLowerCase().includes(q) || x.game.toLowerCase().includes(q));
    const matchesG = !game || x.game === game;
    return matchesQ && matchesG;
  });

  grid.innerHTML = data.map(x => `
    <article class="listing-card">
      <div class="l-media" style="background-image:url('${x.image}')"></div>
      <span class="l-badge">${x.available ? "Available" : "Rented"}</span>
      <div class="l-body">
        <div class="l-title">${x.title}</div>
        <div class="l-meta">${x.game} • Owner ${x.owner}</div>
        <div class="l-row">
          <div class="l-price">${x.priceDay} SUI/day</div>
          <div class="l-actions">
            <button class="secondary-btn" data-id="${x.id}" data-act="details">Details</button>
            <button class="primary-btn"   data-id="${x.id}" data-act="rent" ${x.available ? "" : "disabled"}>Rent</button>
          </div>
        </div>
        <div class="l-meta">Duration: ${x.duration}</div>
      </div>
    </article>
  `).join("");
}

document.getElementById("rentSearch")?.addEventListener("input", renderRentGrid);
document.getElementById("rentGameFilter")?.addEventListener("change", renderRentGrid);
document.getElementById("listItemBtn")?.addEventListener("click", () => {
  alert("MVP: List your item akışı yakında. Şimdilik mock.");
});

// Kart butonları
document.getElementById("rentGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  if (act === "details") alert("Details: " + id);
  if (act === "rent")    alert("Proceed to rent: " + id);
});

// İlk yükleme
fillRentGameFilter();
renderRentGrid();




});
