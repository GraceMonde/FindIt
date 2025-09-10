// Handle modal open
document.getElementById("open-lost-modal").onclick = () =>
  document.getElementById("lost-modal").style.display = "flex";

document.getElementById("open-found-modal").onclick = () =>
  document.getElementById("found-modal").style.display = "flex";

// Close modals
document.querySelectorAll(".close").forEach(btn =>
  btn.addEventListener("click", () => {
    const modalId = btn.getAttribute("data-close");
    document.getElementById(modalId).style.display = "none";
  })
);

// Submit handlers
document.getElementById("lost-form").onsubmit = e => {
  e.preventDefault();
  alert("Lost item submitted!");
  document.getElementById("lost-modal").style.display = "none";
};

document.getElementById("found-form").onsubmit = e => {
  e.preventDefault();
  alert("Found item submitted!");
  document.getElementById("found-modal").style.display = "none";
};
