document.getElementById("searchBtn").addEventListener("click", function () {
    alert("Vyhledávání zatím nefunguje ");
});

document.querySelectorAll(".category").forEach(cat => {
    cat.addEventListener("click", () => {
        alert("Kliknul jsi na: " + cat.dataset.name);
    });
});
