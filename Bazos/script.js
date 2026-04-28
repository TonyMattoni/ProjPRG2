

let currentUser = null;
let allAds = [];
let favorites = [];
let categoryCounts = {};

const citiesCoords = {
    "praha": { lat: 50.0755, lon: 14.4378 },
    "brno": { lat: 49.1951, lon: 16.6068 },
    "ostrava": { lat: 49.8209, lon: 18.2625 },
    "plzen": { lat: 49.7384, lon: 13.3736 },
    "plzeň": { lat: 49.7384, lon: 13.3736 },
    "liberec": { lat: 50.7671, lon: 15.0562 },
    "olomouc": { lat: 49.5938, lon: 17.2509 },
    "ceske budejovice": { lat: 48.9745, lon: 14.4743 },
    "české budějovice": { lat: 48.9745, lon: 14.4743 },
    "pardubice": { lat: 50.0408, lon: 15.7766 },
    "hradec kralove": { lat: 50.2092, lon: 15.8328 },
    "hradec králové": { lat: 50.2092, lon: 15.8328 }
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function normalizeStr(str) {
    return str.trim().toLowerCase();
}

async function initApp() {
    try {
        const userRes = await fetch('api/auth.php?action=me');
        const userData = await userRes.json();
        if (userData.success) currentUser = userData.user;

        const adsRes = await fetch('api/ads.php');
        allAds = await adsRes.json();

        const favRes = await fetch('api/favorites.php');
        const favData = await favRes.json();
        if (favData.success) favorites = favData.favorites;

        const catRes = await fetch('api/categories.php');
        const catData = await catRes.json();
        if (catData.success) categoryCounts = catData.counts;
    } catch(e) {
        console.error("API Error: Backend není dostupný. Běží vám XAMPP a databáze?", e);
    }

    initializeAppLogic();
}

function initializeAppLogic() {
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPath.includes("?")) {
        currentPath = currentPath.split("?")[0];
    }

    const menuElement = document.querySelector(".menu");

    if (menuElement) {
        const isOblibene = currentPath === "oblibene.html" ? 'style="color: #ff7b00; font-weight: 700;"' : '';
        const isMoje = currentPath === "moje-inzeraty.html" ? 'style="color: #ff7b00; font-weight: 700;"' : '';
        const isPridat = currentPath === "pridat-inzerat.html" ? 'style="color: #ff7b00; font-weight: 700;"' : '';
        const isLogin = currentPath === "login.html" ? 'style="color: #ff7b00; font-weight: 700;"' : '';
        const isReg = currentPath === "register.html" ? 'style="color: #ff7b00; font-weight: 700;"' : '';

        if (currentUser) {
            menuElement.innerHTML = `
                <a href="oblibene.html" ${isOblibene}>Oblíbené inzeráty</a>
                <a href="moje-inzeraty.html" ${isMoje}>Moje inzeráty</a>
                <a href="pridat-inzerat.html" ${isPridat}>Přidat inzerát</a>
                <a href="#" id="logoutBtn">Odhlásit (${currentUser.name})</a>
            `;
            document.getElementById("logoutBtn").addEventListener("click", async (e) => {
                e.preventDefault();
                await fetch('api/auth.php?action=logout');
                window.location.reload();
            });
        } else {
            menuElement.innerHTML = `
                <a href="oblibene.html" ${isOblibene}>Oblíbené inzeráty</a>
                <a href="login.html" ${isLogin}>Přihlásit</a>
                <a href="register.html" ${isReg}>Registrovat</a>
                <a href="pridat-inzerat.html" ${isPridat}>Přidat inzerát</a>
            `;
        }
    }



    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const pass = document.getElementById("loginPassword").value;
            
            const res = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password: pass})
            });
            const data = await res.json();
            if(data.success) {
                window.location.href = "index.html";
            } else {
                document.getElementById("loginError").innerText = data.message;
                document.getElementById("loginError").style.display = "block";
            }
        });
    }

    const regForm = document.getElementById("registerForm");
    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const pass = document.getElementById("regPassword").value;
            
            const res = await fetch('api/auth.php?action=register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, email, password: pass})
            });
            const data = await res.json();
            if(data.success) {
                window.location.href = "index.html";
            } else {
                document.getElementById("regError").innerText = data.message;
                document.getElementById("regError").style.display = "block";
            }
        });
    }

    const addForm = document.getElementById("addForm");
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentUser) {
                alert("Pro přidání inzerátu se musíte přihlásit.");
                window.location.href = "login.html";
                return;
            }
            const cat = document.getElementById("addCat").value;
            const title = document.getElementById("addTitle").value;
            const desc = document.getElementById("addDesc").value;
            const price = parseInt(document.getElementById("addPrice").value);
            const loc = document.getElementById("addLoc").value;
            const imgInput = document.getElementById("addImg");
            
            const formData = new FormData();
            formData.append('category', cat);
            formData.append('title', title);
            formData.append('desc', desc);
            formData.append('price', price);
            formData.append('location', loc);
            if (imgInput.files.length > 0) {
                formData.append('image', imgInput.files[0]);
            }

            const res = await fetch('api/ads.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if(data.success) {
                alert("Inzerát byl přidán do databáze!");
                window.location.href = "moje-inzeraty.html";
            } else {
                alert("Chyba při přidávání inzerátu.");
            }
        });
    }

    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", performSearch);
    const searchBtnInz = document.getElementById("searchBtnInzeraty");
    if (searchBtnInz) searchBtnInz.addEventListener("click", performSearch);

    function performSearch() {
        const what = document.getElementById('searchInputWhat').value;
        const where = document.getElementById('searchInputWhere').value;
        const dist = document.getElementById('searchInputDistance').value;
        const pFrom = document.getElementById('searchInputPriceFrom').value;
        const pTo = document.getElementById('searchInputPriceTo').value;
        
        let queryParams = [];
        if (what) queryParams.push("hledani=" + encodeURIComponent(what));
        if (where) queryParams.push("lokalita=" + encodeURIComponent(where));
        if (dist) queryParams.push("vzdalenost=" + encodeURIComponent(dist));
        if (pFrom) queryParams.push("cenaOd=" + encodeURIComponent(pFrom));
        if (pTo) queryParams.push("cenaTo=" + encodeURIComponent(pTo));
        
        if (queryParams.length > 0) {
            window.location.href = "inzeraty.html?" + queryParams.join('&');
        } else {
            window.location.href = "inzeraty.html";
        }
    }

    document.querySelectorAll(".category").forEach(cat => {
        const catName = cat.dataset.name;
        const countSpan = document.getElementById("count-" + catName);
        if (countSpan) {
            const count = categoryCounts[catName] || 0;
            countSpan.innerText = `(${count})`;
            countSpan.style.color = "#ff7b00";
            countSpan.style.fontSize = "14px";
            countSpan.style.marginLeft = "5px";
        }
        cat.addEventListener("click", () => {
            window.location.href = "inzeraty.html?kategorie=" + encodeURIComponent(catName);
        });
    });

    function renderAd(ad, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const isFav = favorites.includes(ad.id);
        const heartIcon = isFav ? "♥" : "♡";
        const heartColor = isFav ? "red" : "#ccc";

        const imgHtml = ad.image && ad.image.trim() !== "" ? `<img src="${ad.image}" alt="${ad.title}">` : `Bez fotky`;

        let deleteBtnHtml = "";
        if (currentPath === "moje-inzeraty.html" || (currentUser && ad.author === currentUser.email)) {
            deleteBtnHtml = `<button class="delete-btn" data-id="${ad.id}" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px; font-weight: bold;">Smazat inzerát</button>`;
        }

        const item = document.createElement("div");
        item.className = "ad-item";
        item.innerHTML = `
            <div class="ad-image">${imgHtml}</div>
            <div class="ad-content">
                <div style="display: flex; justify-content: space-between;">
                    <h3 class="ad-title"><a href="detail.html?id=${ad.id}" style="text-decoration: none; color: inherit;">${ad.title}</a></h3>
                    <span class="heart-btn" data-id="${ad.id}" style="font-size: 24px; cursor: pointer; color: ${heartColor};">${heartIcon}</span>
                </div>
                <p class="ad-desc">${ad.desc.substring(0, 100)}${ad.desc.length > 100 ? "..." : ""}</p>
                <p style="font-size: 13px; color: #888;">Lokalita: ${ad.location} | Kategorie: ${ad.category}</p>
                <div class="ad-price">${ad.price} Kč</div>
                ${deleteBtnHtml}
            </div>
        `;
        container.appendChild(item);
    }

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("heart-btn")) {
            if (!currentUser) {
                alert("Pro přidání do oblíbených se musíte přihlásit.");
                return;
            }
            const id = parseInt(e.target.dataset.id);
            const res = await fetch('api/favorites.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ad_id: id})
            });
            const data = await res.json();
            
            if (data.status === "added") {
                favorites.push(id);
                e.target.innerText = "♥";
                e.target.style.color = "red";
            } else if (data.status === "removed") {
                favorites = favorites.filter(f => f !== id);
                e.target.innerText = "♡";
                e.target.style.color = "#ccc";
            }
            if (currentPath === "oblibene.html") {
                window.location.reload();
            }
        }
        if (e.target.classList.contains("delete-btn")) {
            if (confirm("Opravdu chcete tento inzerát smazat?")) {
                const id = parseInt(e.target.dataset.id);
                const res = await fetch('api/ads.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({action: 'delete', id: id})
                });
                const data = await res.json();
                if(data.success) {
                    window.location.reload();
                } else {
                    alert("Chyba při mazání.");
                }
            }
        }
    });

    function renderFilteredAds(filteredAds, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const sortSelect = document.getElementById("sortAds");
        if (sortSelect) {
            const sortVal = sortSelect.value;
            if (sortVal === "price-asc") {
                filteredAds.sort((a,b) => a.price - b.price);
            } else if (sortVal === "price-desc") {
                filteredAds.sort((a,b) => b.price - a.price);
            } else if (sortVal === "newest") {
                filteredAds.sort((a,b) => b.id - a.id);
            }
        }

        container.innerHTML = "";
        if (filteredAds.length === 0) {
            container.innerHTML = "<p>Žádné inzeráty neodpovídají hledání.</p>";
        } else {
            filteredAds.forEach(ad => renderAd(ad, containerId));
        }
    }

    if (currentPath === "inzeraty.html" && document.getElementById("adList")) {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('kategorie');
        const what = urlParams.get('hledani');
        const where = urlParams.get('lokalita');
        const dist = urlParams.get('vzdalenost');
        const pFrom = urlParams.get('cenaOd');
        const pTo = urlParams.get('cenaTo'); 
        
        let filtered = allAds.filter(ad => {
            let ok = true;
            if (cat && ad.category !== cat) ok = false;
            if (what && !ad.title.toLowerCase().includes(what.toLowerCase()) && !ad.desc.toLowerCase().includes(what.toLowerCase())) ok = false;
            if (pFrom && ad.price < parseInt(pFrom)) ok = false;
            if (pTo && ad.price > parseInt(pTo)) ok = false;
            if (where) {
                const adLoc = normalizeStr(ad.location);
                const searchLoc = normalizeStr(where);
                if (dist && dist !== "") {
                    if (citiesCoords[searchLoc] && citiesCoords[adLoc]) {
                        const d = getDistance(
                            citiesCoords[searchLoc].lat, citiesCoords[searchLoc].lon,
                            citiesCoords[adLoc].lat, citiesCoords[adLoc].lon
                        );
                        if (d > parseInt(dist)) ok = false;
                    } else {
                        if (!adLoc.includes(searchLoc)) ok = false;
                    }
                } else {
                    if (!adLoc.includes(searchLoc)) ok = false;
                }
            }
            return ok;
        });
        
        renderFilteredAds(filtered, "adList");

        const sortSelect = document.getElementById("sortAds");
        if (sortSelect) {
            sortSelect.addEventListener("change", () => {
                renderFilteredAds(filtered, "adList");
            });
        }
    }

    if (currentPath === "moje-inzeraty.html") {
        const list = document.getElementById("myAdList");
        if (list) {
            if (!currentUser) {
                list.innerHTML = "<p>Pro zobrazení inzerátů se musíte přihlásit.</p><a href='login.html' class='btn-primary'>Přihlásit se</a>";
            } else {
                const myAds = allAds.filter(a => a.author === currentUser.email);
                list.innerHTML = "";
                if (myAds.length === 0) {
                    list.innerHTML = "<p>Zatím nemáte žádné aktivní inzeráty.</p>";
                } else {
                    myAds.forEach(ad => renderAd(ad, "myAdList"));
                }
            }
        }
    }

    if (currentPath === "oblibene.html") {
        const list = document.getElementById("favAdList");
        if (list) {
            if (!currentUser) {
                list.innerHTML = "<p>Pro zobrazení oblíbených se musíte přihlásit.</p><a href='login.html' class='btn-primary'>Přihlásit se</a>";
            } else {
                const favAds = allAds.filter(a => favorites.includes(a.id));
                list.innerHTML = "";
                if (favAds.length === 0) {
                    list.innerHTML = "<p>Zatím nemáte uložené žádné oblíbené inzeráty.</p>";
                } else {
                    favAds.forEach(ad => renderAd(ad, "favAdList"));
                }
            }
        }
    }

    if (currentPath === "detail.html" || currentPath.startsWith("detail.html")) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = parseInt(urlParams.get("id"));
        const detailContainer = document.getElementById("adDetailContainer");
        
        if (detailContainer && id) {
            const ad = allAds.find(a => a.id === id);
            
            if (ad) {
                const imgHtml = ad.image && ad.image.trim() !== "" ? `<img src="${ad.image}" alt="${ad.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; background: #eee; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">` : `<div style="background: #eee; width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #999;">Bez fotky</div>`;
                
                document.title = ad.title + " | Bazoš – demo";
                detailContainer.innerHTML = `
                    <div style="display: flex; flex-wrap: wrap; gap: 30px;">
                        <div style="flex: 1; min-width: 300px; overflow: hidden; border-radius: 8px; background: #fafafa;">
                            ${imgHtml}
                        </div>
                        <div style="flex: 1; min-width: 300px;">
                            <h2 style="margin-top: 0; color: #ff7b00;">${ad.title}</h2>
                            <h3 style="color: #333; font-size: 24px; margin: 10px 0;">${ad.price} Kč</h3>
                            <p><strong>Lokalita:</strong> ${ad.location}</p>
                            <p><strong>Kategorie:</strong> ${ad.category}</p>
                            <p><strong>Autor:</strong> ${ad.author}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="white-space: pre-line; line-height: 1.6;">${ad.desc}</p>
                            
                            <div class="contact-box" style="margin-top: 30px; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                                <h4 style="margin-top: 0;">Kontaktovat prodejce</h4>
                                <textarea rows="4" placeholder="Váš vzkaz..." style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-family: 'Inter', sans-serif;"></textarea>
                                <button class="btn-primary" onclick="alert('Zpráva odeslána na e-mail prodejce!')">Odeslat zprávu</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                detailContainer.innerHTML = "<p>Inzerát nebyl nalezen.</p>";
            }
        }
    }
}


initApp();
