const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", function () {
        const what = document.getElementById('searchInputWhat').value;
        const where = document.getElementById('searchInputWhere').value;
        const distance = document.getElementById('searchInputDistance').value;
        const priceFrom = document.getElementById('searchInputPriceFrom').value;
        const priceTo = document.getElementById('searchInputPriceTo').value;
        
        let queryParams = [];
        if (what) queryParams.push("hledani=" + encodeURIComponent(what));
        if (where) queryParams.push("lokalita=" + encodeURIComponent(where));
        if (distance) queryParams.push("vzdalenost=" + encodeURIComponent(distance));
        if (priceFrom) queryParams.push("cenaOd=" + encodeURIComponent(priceFrom));
        if (priceTo) queryParams.push("cenaDo=" + encodeURIComponent(priceTo));
        
        if (queryParams.length > 0) {
            window.location.href = "inzeraty.html?" + queryParams.join('&');
        } else {
            alert("Zadejte něco do vyhledávání.");
        }
    });
}

document.querySelectorAll(".category").forEach(cat => {
    cat.addEventListener("click", () => {
        window.location.href = "inzeraty.html?kategorie=" + encodeURIComponent(cat.dataset.name);
    });
});
