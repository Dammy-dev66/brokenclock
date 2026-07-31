(function () {
  const form = document.getElementById("fbProofForm");
  const hiddenDeadline = document.getElementById("fbDeadline");
  const dateInput = document.getElementById("fbDeadlineDate");
  const timeInput = document.getElementById("fbDeadlineTime");
  const tzInput = document.getElementById("fbDeadlineTimezone");
  const utcInput = document.getElementById("fbDeadlineUtc");
  const dublinInput = document.getElementById("fbDeadlineDublinLocal");

  const clientZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  function zoneOffsetMinutes(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).formatToParts(date).reduce((out, p) => {
      if (p.type !== "literal") out[p.type] = p.value;
      return out;
    }, {});
    const asUtc = Date.UTC(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour), Number(parts.minute), Number(parts.second)
    );
    return Math.round((asUtc - date.getTime()) / 60000);
  }

  function wallTimeToUtc(dateStr, timeStr, timeZone) {
    const guess = new Date(dateStr + "T" + timeStr + ":00Z");
    const offset = zoneOffsetMinutes(guess, timeZone);
    return new Date(guess.getTime() - offset * 60000);
  }

  function updateDeadline() {
    hiddenDeadline.value = dateInput.value && timeInput.value
      ? dateInput.value + " " + timeInput.value
      : dateInput.value;

    if (dateInput.value && timeInput.value) {
      const utcDate = wallTimeToUtc(dateInput.value, timeInput.value, clientZone);
      tzInput.value = clientZone;
      utcInput.value = utcDate.toISOString();
      dublinInput.value = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Dublin",
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "shortOffset"
      }).format(utcDate);
    } else {
      tzInput.value = "";
      utcInput.value = "";
      dublinInput.value = "";
    }
  }

  dateInput.addEventListener("change", updateDeadline);
  timeInput.addEventListener("change", updateDeadline);
  form.addEventListener("submit", updateDeadline, true);
  updateDeadline();
})();
