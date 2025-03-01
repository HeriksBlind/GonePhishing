document.addEventListener("DOMContentLoaded", () => {
  let links = document.querySelectorAll("a");
  
  links.forEach(link => {
    if (isShortenedURL(link.href)) {
      link.style.color = "red";
      alert("⚠️ Warning! Shortened URL detected: " + link.href);
    }
  });
});

// ✅ Check if a URL is shortened (bit.ly, tinyurl)
function isShortenedURL(url) {
  return url.includes("bit.ly") || url.includes("tinyurl.com") || url.includes("t.co");
}
