<script>
(function () {
  function start() {
    const editorZone = "Europe/Dublin";
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const $ = (selector) => document.querySelector(selector);

    const nodes = {
      editorStatus: $("[data-editor-status-mini]"),
      editorStatusText: $("[data-editor-status-text-mini]"),
      editorTime: $("[data-editor-time-mini]"),
      editorSeconds: $("[data-editor-seconds-mini]"),
      editorZone: $("[data-editor-zone-mini]"),
      editorDate: $("[data-editor-date-mini]"),
      localCity: $("[data-local-city-mini]"),
      localTime: $("[data-local-time-mini]"),
      localSeconds: $("[data-local-seconds-mini]"),
      localZone: $("[data-local-zone-mini]"),
      localDate: $("[data-local-date-mini]"),
      timeDifference: $("[data-time-difference-mini]"),
      replyNote: $("[data-reply-note-mini]")
    };

    if (!nodes.editorStatus) return;

    function partsFor(date, timeZone) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone, weekday: "long", day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZoneName: "shortOffset"
      }).formatToParts(date);
      return parts.reduce((output, part) => {
        if (part.type !== "literal") output[part.type] = part.value;
        return output;
      }, {});
    }

    function timezoneOffsetMinutes(date, timeZone) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).formatToParts(date).reduce((output, part) => {
        if (part.type !== "literal") output[part.type] = part.value;
        return output;
      }, {});
      const asUtc = Date.UTC(
        Number(parts.year), Number(parts.month) - 1, Number(parts.day),
        Number(parts.hour), Number(parts.minute), Number(parts.second)
      );
      return Math.round((asUtc - date.getTime()) / 60000);
    }

    function formatZoneName(value) {
      return (value || "GMT").replace("UTC", "GMT").replace("GMT+0", "GMT");
    }

    function formatDate(parts) {
      return `${parts.weekday}, ${Number(parts.day)} ${parts.month} ${parts.year}`;
    }

    function cityFromTimeZone(timeZone) {
      const city = timeZone.split("/").pop() || "Local time";
      return city.replace(/_/g, " ");
    }

    function isEditorOpen(parts) {
      const weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const minutes = Number(parts.hour) * 60 + Number(parts.minute);
      return weekday.includes(parts.weekday) && minutes >= 540 && minutes < 1140;
    }

    function differenceText(date) {
      const editorOffset = timezoneOffsetMinutes(date, editorZone);
      const userOffset = timezoneOffsetMinutes(date, userZone);
      const diffMinutes = userOffset - editorOffset;
      if (diffMinutes === 0) return "Same local time as the editor";
      const absMinutes = Math.abs(diffMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;
      const pieces = [];
      if (hours) pieces.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
      if (minutes) pieces.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
      return `${pieces.join(" ")} ${diffMinutes > 0 ? "ahead of" : "behind"} the editor`;
    }

    function updateClock() {
      const now = new Date();
      const editor = partsFor(now, editorZone);
      const local = partsFor(now, userZone);
      const open = isEditorOpen(editor);

      nodes.editorTime.textContent = `${editor.hour}:${editor.minute}`;
      nodes.editorSeconds.textContent = `:${editor.second}`;
      nodes.editorZone.textContent = formatZoneName(editor.timeZoneName);
      nodes.editorDate.textContent = formatDate(editor);

      nodes.localCity.textContent = cityFromTimeZone(userZone);
      nodes.localTime.textContent = `${local.hour}:${local.minute}`;
      nodes.localSeconds.textContent = `:${local.second}`;
      nodes.localZone.textContent = formatZoneName(local.timeZoneName);
      nodes.localDate.textContent = formatDate(local);

      nodes.editorStatus.classList.toggle("is-closed", !open);
      nodes.editorStatusText.textContent = open ? "Open now" : "After hours";
      nodes.timeDifference.textContent = differenceText(now);
      nodes.replyNote.textContent = open
        ? "You're within the editor's usual working hours (Mon-Fri, 09:00-19:00 Dublin time) - expect a reply the same working day."
        : "You're outside the editor's usual working hours - your request will be reviewed within 24 hours.";
    }

    updateClock();
    window.setInterval(updateClock, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
</script>
