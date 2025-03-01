document.getElementById("checkUrl").addEventListener("click", async function () {
    let url = document.getElementById("urlInput").value;
    let phishingList = await fetch("https://openphish.com/feed.txt").then(res => res.text());

    let score = analyzeURL(url);
    let isPhishing = phishingList.includes(url) || score >= 2;

    if (isPhishing) {
        document.getElementById("result").innerText = "⚠️ This site may be a phishing attempt!";
    } else {
        document.getElementById("result").innerText = "✅ This site seems safe.";
    }
});
