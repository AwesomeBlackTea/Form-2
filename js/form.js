function initForm() {
  const dataForm = document.getElementById("dataForm");
  if (!dataForm) return;
  const introduction = dataForm.querySelector('textarea[name="introduction"]');
  const dateInput = document.getElementById("date");
  const dateFromEl = document.getElementById("dateFrom");
  const dateToEl = document.getElementById("dateTo");
  const dateSingleWrap = document.getElementById("dateSingleWrap");
  const dateRangeWrap = document.getElementById("dateRangeWrap");
  const rangeScheduleBlock = document.getElementById("rangeScheduleBlock");
  const weekScheduleEditor = document.getElementById("weekScheduleEditor");
  const toggleDate = document.getElementById("toggleDate");
  const sectionDate = document.getElementById("sectionDate");
  const toggleImport = document.getElementById("toggleImport");
  const sectionImport = document.getElementById("sectionImport");
  const fileImport = document.getElementById("fileImport");
  const fileImportLabel = document.getElementById("fileImportLabel");
  const peopleListEditor = document.getElementById("peopleListEditor");
  const importError = document.getElementById("importError");
  const addPersonName = document.getElementById("addPersonName");
  const addPersonPhone = document.getElementById("addPersonPhone");
  const addPersonBtn = document.getElementById("addPersonBtn");
  const toggleRest = document.getElementById("toggleRest");
  const toggleArrived = document.getElementById("toggleArrived");
  const sectionRest = document.getElementById("sectionRest");
  const sectionArrived = document.getElementById("sectionArrived");
  const peopleRest = document.getElementById("peopleRest");
  const peopleArrived = document.getElementById("peopleArrived");
  const clearRestBtn = document.getElementById("clearRestBtn");
  const clearArrivedBtn = document.getElementById("clearArrivedBtn");
  const PEOPLE_LIST_KEY = "peopleList";
  const toggleWeapon = document.getElementById("toggleWeapon");
  const toggleNote = document.getElementById("toggleNote");
  const sectionWeapon = document.getElementById("sectionWeapon");
  const sectionNote = document.getElementById("sectionNote");
  const resultBtn = document.getElementById("resultBtn");
  const shareBtn = document.getElementById("shareBtn");
  const copyBtn = document.getElementById("copyBtn");
  const previewModal = document.getElementById("previewModal");
  const previewModalContent = document.getElementById("previewModalContent");
  const previewModalClose = document.getElementById("previewModalClose");

  const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  function normalizeScheduleByDate(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    Object.keys(raw).forEach(k => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      const arr = raw[k];
      if (!Array.isArray(arr)) return;
      out[k] = arr.map(v => String(v ?? "").trim()).filter(Boolean);
    });
    return out;
  }

  function formatDDMMYYYY(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return [d, m, y].join("/");
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatRangeHeader(startIso, endIso) {
    const [sy, sm, sd] = startIso.split("-").map(Number);
    const [ey, em, ed] = endIso.split("-").map(Number);
    if (sy === ey && sm === em) return `${pad2(sd)}.${pad2(sm)}-${pad2(ed)}.${pad2(em)}`;
    if (sy === ey) return `${pad2(sd)}.${pad2(sm)}-${pad2(ed)}.${pad2(em)}`;
    return `${pad2(sd)}.${pad2(sm)}.${sy}-${pad2(ed)}.${pad2(em)}.${ey}`;
  }

  function parseLocalDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function orderedDatesInRange(fromIso, toIso) {
    let start = parseLocalDate(fromIso);
    let end = parseLocalDate(toIso);
    if (end < start) {
      const t = start;
      start = end;
      end = t;
    }
    const out = [];
    const cur = new Date(start);
    while (cur <= end) {
      const y = cur.getFullYear();
      const mo = pad2(cur.getMonth() + 1);
      const da = pad2(cur.getDate());
      out.push(`${y}-${mo}-${da}`);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  function labelForDateIso(iso) {
    const d = parseLocalDate(iso);
    const wd = WEEKDAY_LABELS[(d.getDay() + 6) % 7];
    const [, m, dd] = iso.split("-");
    return `${wd} ${pad2(Number(dd))}.${pad2(Number(m))}`;
  }

  function formatWeekdayScheduleBlock(label, people) {
    if (!people.length) return "";
    const lines = [];
    lines.push(`${label}  ${people[0].name.trim()}`);
    if ((people[0].phone || "").trim()) lines.push(people[0].phone.trim());
    for (let i = 1; i < people.length; i++) {
      lines.push(people[i].name.trim());
      if ((people[i].phone || "").trim()) lines.push(people[i].phone.trim());
    }
    return lines.join("\n");
  }

  function optionValuesToPeople(values) {
    return values
      .map(v => {
        const [name, phone] = String(v || "").split("|");
        return { name: (name || "").trim(), phone: (phone || "").trim() };
      })
      .filter(p => p.name || p.phone);
  }

  const weaponInput = document.getElementById("weapon");
  const noteInput = document.getElementById("note");

  const saved = JSON.parse(localStorage.getItem("changeData") || "{}");
  let scheduleByDate = normalizeScheduleByDate(saved.scheduleByDate);

  const defaultIntroduction = "Хмара.\nБажаю міцного.\nЗаміна особового складу ДФТГ.";
  introduction.value = saved.introduction || defaultIntroduction;
  dateInput.value = saved.date || "";
  if (saved.dateMode === "range") {
    const r = document.getElementById("dateModeRange");
    const s = document.getElementById("dateModeSingle");
    if (r && s) {
      r.checked = true;
      s.checked = false;
    }
  }
  if (dateFromEl) dateFromEl.value = saved.dateFrom || "";
  if (dateToEl) dateToEl.value = saved.dateTo || "";

  if (saved.weapon !== undefined) weaponInput.value = saved.weapon;
  else weaponInput.value = "без змін";
  const defaultNote = "Прошу додати в Шістку.\nДякую.";
  noteInput.value = saved.note || defaultNote;

  function isRangeMode() {
    const el = document.querySelector('input[name="dateMode"]:checked');
    return el && el.value === "range";
  }

  function getRangeBounds() {
    const from = dateFromEl ? dateFromEl.value : "";
    const to = dateToEl ? dateToEl.value : "";
    if (!from || !to) return null;
    const start = from <= to ? from : to;
    const end = from <= to ? to : from;
    return { start, end };
  }

  function syncScheduleKeysToRange(startIso, endIso) {
    const valid = new Set(orderedDatesInRange(startIso, endIso));
    Object.keys(scheduleByDate).forEach(k => {
      if (!valid.has(k)) delete scheduleByDate[k];
    });
    valid.forEach(k => {
      if (!Array.isArray(scheduleByDate[k])) scheduleByDate[k] = [];
    });
  }

  function syncScheduleByDateFromDom() {
    if (!weekScheduleEditor) return;
    weekScheduleEditor.querySelectorAll("[data-schedule-date]").forEach(panel => {
      const iso = panel.getAttribute("data-schedule-date");
      const box = panel.querySelector(".range-day-checkboxes");
      if (!iso || !box) return;
      scheduleByDate[iso] = getCheckedValues(box);
    });
  }

  function syncDateModeUI() {
    const range = isRangeMode();
    if (dateSingleWrap) dateSingleWrap.hidden = range;
    if (dateRangeWrap) dateRangeWrap.hidden = !range;
  }

  function renderRangeScheduleEditor() {
    if (!weekScheduleEditor || !rangeScheduleBlock) return;
    if (!toggleDate.checked || !isRangeMode()) {
      syncScheduleByDateFromDom();
      saveChangeData();
      rangeScheduleBlock.hidden = true;
      weekScheduleEditor.innerHTML = "";
      return;
    }
    rangeScheduleBlock.hidden = false;
    const bounds = getRangeBounds();
    syncScheduleByDateFromDom();
    weekScheduleEditor.innerHTML = "";
    if (!bounds) {
      const p = document.createElement("p");
      p.className = "people-checkbox-empty";
      p.textContent = "Вкажіть «Від» і «До» у блоці Дата.";
      weekScheduleEditor.appendChild(p);
      saveChangeData();
      return;
    }
    syncScheduleKeysToRange(bounds.start, bounds.end);
    const dates = orderedDatesInRange(bounds.start, bounds.end);
    dates.forEach(iso => {
      const dayBlock = document.createElement("div");
      dayBlock.className = "week-schedule-day";
      dayBlock.setAttribute("data-schedule-date", iso);
      const h = document.createElement("h4");
      h.className = "week-schedule-day-title";
      h.textContent = labelForDateIso(iso);
      dayBlock.appendChild(h);
      const list = document.createElement("div");
      list.className = "people-checkbox-list range-day-checkboxes";
      list.setAttribute("role", "group");
      list.setAttribute("aria-label", `На зміні ${labelForDateIso(iso)}`);
      dayBlock.appendChild(list);
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "multiselect-clear";
      clearBtn.textContent = "Зняти всі";
      clearBtn.onclick = () => {
        clearAllInList(list);
        renderRangeScheduleEditor();
      };
      dayBlock.appendChild(clearBtn);
      weekScheduleEditor.appendChild(dayBlock);
      fillPeopleCheckboxList(list, scheduleByDate[iso] || [], saveChangeData);
    });
    saveChangeData();
  }

  function getCheckedValues(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  }

  function saveChangeData() {
    syncScheduleByDateFromDom();
    const restValues = getCheckedValues(peopleRest);
    const arrivedValues = getCheckedValues(peopleArrived);
    const modeEl = document.querySelector('input[name="dateMode"]:checked');
    localStorage.setItem("changeData", JSON.stringify({
      introduction: introduction.value,
      date: dateInput.value,
      dateMode: modeEl && modeEl.value === "range" ? "range" : "single",
      dateFrom: dateFromEl ? dateFromEl.value : "",
      dateTo: dateToEl ? dateToEl.value : "",
      scheduleByDate,
      weapon: weaponInput.value,
      note: noteInput.value,
      on_rest: restValues,
      arrived: arrivedValues
    }));
  }

  introduction.oninput = saveChangeData;
  dateInput.oninput = saveChangeData;
  if (dateFromEl) {
    dateFromEl.oninput = () => {
      const b = getRangeBounds();
      if (b) syncScheduleKeysToRange(b.start, b.end);
      saveChangeData();
      renderRangeScheduleEditor();
    };
  }
  if (dateToEl) {
    dateToEl.oninput = () => {
      const b = getRangeBounds();
      if (b) syncScheduleKeysToRange(b.start, b.end);
      saveChangeData();
      renderRangeScheduleEditor();
    };
  }
  weaponInput.oninput = saveChangeData;
  noteInput.oninput = saveChangeData;

  document.querySelectorAll('input[name="dateMode"]').forEach(r => {
    r.addEventListener("change", () => {
      syncDateModeUI();
      saveChangeData();
      renderRangeScheduleEditor();
    });
  });

  function getPeopleList() {
    try {
      const raw = localStorage.getItem(PEOPLE_LIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function setPeopleList(list) {
    localStorage.setItem(PEOPLE_LIST_KEY, JSON.stringify(list));
  }

  function peopleToOptionValue(person) {
    return (person.name || "").trim() + "|" + (person.phone || "").trim();
  }

  function fillPeopleCheckboxList(container, selectedValues, onChangeCb) {
    if (!container) return;
    const people = getPeopleList();
    container.innerHTML = "";
    if (!people.length) {
      const empty = document.createElement("p");
      empty.className = "people-checkbox-empty";
      empty.textContent = "Список порожній. Імпортуйте файл або додайте вручну.";
      container.appendChild(empty);
      return;
    }
    const handler = typeof onChangeCb === "function" ? onChangeCb : saveChangeData;
    people.forEach(person => {
      const value = peopleToOptionValue(person);
      const label = document.createElement("label");
      label.className = "people-checkbox-item";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = value;
      if (selectedValues && selectedValues.includes(value)) cb.checked = true;
      cb.onchange = handler;
      const text = document.createElement("span");
      text.textContent = (person.name || "").trim() + " — " + (person.phone || "").trim();
      label.appendChild(cb);
      label.appendChild(text);
      container.appendChild(label);
    });
  }

  function refreshPeopleSelects() {
    syncScheduleByDateFromDom();
    const latest = JSON.parse(localStorage.getItem("changeData") || "{}");
    fillPeopleCheckboxList(peopleRest, latest.on_rest || []);
    fillPeopleCheckboxList(peopleArrived, latest.arrived || []);
    renderRangeScheduleEditor();
  }

  function renderPeopleListEditor() {
    if (!peopleListEditor) return;
    const people = getPeopleList();
    peopleListEditor.innerHTML = "";
    if (people.length === 0) {
      const empty = document.createElement("p");
      empty.className = "people-list-editor-empty";
      empty.textContent = "Список порожній. Імпортуйте файл або додайте вручну.";
      peopleListEditor.appendChild(empty);
      return;
    }
    people.forEach((person, index) => {
      const row = document.createElement("div");
      row.className = "people-list-editor-item";
      const text = document.createElement("span");
      text.className = "people-list-editor-name";
      text.textContent = (person.name || "").trim() + " — " + (person.phone || "").trim();
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "people-list-editor-remove";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = "Видалити";
      removeBtn.setAttribute("aria-label", "Видалити");
      removeBtn.onclick = () => {
        const list = getPeopleList();
        list.splice(index, 1);
        setPeopleList(list);
        refreshPeopleSelects();
        renderPeopleListEditor();
      };
      row.appendChild(text);
      row.appendChild(removeBtn);
      peopleListEditor.appendChild(row);
    });
  }

  if (addPersonBtn && addPersonName && addPersonPhone) {
    addPersonBtn.onclick = () => {
      const name = addPersonName.value.trim();
      const phone = addPersonPhone.value.trim();
      if (!name && !phone) return;
      const list = getPeopleList();
      list.push({ name, phone });
      setPeopleList(list);
      addPersonName.value = "";
      addPersonPhone.value = "";
      refreshPeopleSelects();
      renderPeopleListEditor();
    };
  }

  toggleDate.onchange = () => {
    sectionDate.classList.toggle("is-visible", toggleDate.checked);
    renderRangeScheduleEditor();
  };
  toggleImport.onchange = () => {
    sectionImport.classList.toggle("is-visible", toggleImport.checked);
    if (toggleImport.checked && peopleListEditor) renderPeopleListEditor();
    renderRangeScheduleEditor();
  };
  toggleRest.onchange = () => sectionRest.classList.toggle("is-visible", toggleRest.checked);
  toggleArrived.onchange = () => sectionArrived.classList.toggle("is-visible", toggleArrived.checked);

  function clearAllInList(container) {
    if (!container) return;
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    saveChangeData();
  }
  if (clearRestBtn) clearRestBtn.onclick = () => clearAllInList(peopleRest);
  if (clearArrivedBtn) clearArrivedBtn.onclick = () => clearAllInList(peopleArrived);
  toggleWeapon.onchange = () => sectionWeapon.classList.toggle("is-visible", toggleWeapon.checked);
  toggleNote.onchange = () => sectionNote.classList.toggle("is-visible", toggleNote.checked);
  sectionDate.classList.toggle("is-visible", toggleDate.checked);
  sectionImport.classList.toggle("is-visible", toggleImport.checked);
  sectionRest.classList.toggle("is-visible", toggleRest.checked);
  sectionArrived.classList.toggle("is-visible", toggleArrived.checked);
  sectionWeapon.classList.toggle("is-visible", toggleWeapon.checked);
  sectionNote.classList.toggle("is-visible", toggleNote.checked);

  function parseCSVText(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => {
      const row = [];
      let cell = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if ((c === "," || c === ";") && !inQuotes) {
          row.push(cell.trim());
          cell = "";
        } else {
          cell += c;
        }
      }
      row.push(cell.trim());
      return row;
    });
  }

  function rowsToPeopleList(rows) {
    const people = [];
    rows.forEach(row => {
      const name = String(row[0] ?? "").trim();
      const phone = String(row[1] ?? "").trim();
      if (name || phone) people.push({ name, phone });
    });
    return people;
  }

  fileImport.onchange = () => {
    const file = fileImport.files && fileImport.files[0];
    if (importError) importError.textContent = "";
    if (fileImportLabel) fileImportLabel.textContent = "Обрати файл (CSV або Excel)";
    if (!file) return;
    fileImportLabel.textContent = file.name;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let rows;
        if (ext === "csv") {
          rows = parseCSVText(e.target.result);
        } else if (ext === "xlsx" || ext === "xls") {
          const wb = typeof XLSX !== "undefined" ? XLSX.read(e.target.result, { type: "arraybuffer" }) : null;
          if (!wb || !wb.SheetNames.length) throw new Error("No sheet");
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        } else {
          rows = parseCSVText(e.target.result);
        }
        const people = rowsToPeopleList(rows);
        setPeopleList(people);
        refreshPeopleSelects();
        renderPeopleListEditor();
      } catch (err) {
        if (importError) importError.textContent = "Помилка читання файлу.";
      }
      fileImport.value = "";
    };
    if (ext === "csv") reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  syncDateModeUI();
  refreshPeopleSelects();
  renderPeopleListEditor();
  renderRangeScheduleEditor();

  function getSelectedPeopleText(container) {
    const values = getCheckedValues(container);
    if (!values.length) return "";
    return values
      .map(v => {
        const [name, phone] = (v || "").split("|");
        return [name, phone].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n");
  }

  function appendDateToReport(report, formData) {
    if (!toggleDate.checked) return report;
    if (isRangeMode()) {
      const from = (dateFromEl && dateFromEl.value) || "";
      const to = (dateToEl && dateToEl.value) || "";
      if (!from || !to) return report;
      const start = from <= to ? from : to;
      const end = from <= to ? to : from;
      const rangeLine = formatRangeHeader(start, end);
      report += (report ? "\n" : "") + rangeLine;
      const dates = orderedDatesInRange(start, end);
      const blocks = [];
      dates.forEach(iso => {
        const values = scheduleByDate[iso] || [];
        const people = optionValuesToPeople(values);
        if (!people.length) return;
        const block = formatWeekdayScheduleBlock(labelForDateIso(iso), people);
        if (block) blocks.push(block);
      });
      if (blocks.length) {
        report += "\n" + blocks.join("\n\n");
        report += "\n";
      }
      return report;
    }
    const single = (formData.date || "").trim();
    if (single) report += (report ? "\n" : "") + formatDDMMYYYY(single);
    return report;
  }

  function buildReport() {
    syncScheduleByDateFromDom();
    const formData = Object.fromEntries(new FormData(dataForm).entries());
    let report = (formData.introduction || "").trim();
    report = appendDateToReport(report, formData);
    if (toggleRest.checked) {
      const restText = getSelectedPeopleText(peopleRest);
      if (restText) report += (report ? "\n" : "") + "На відпочинок:\n" + restText;
    }
    if (toggleArrived.checked) {
      const arrivedText = getSelectedPeopleText(peopleArrived);
      if (arrivedText) report += (report ? "\n" : "") + "Прибули:\n" + arrivedText;
    }
    if (toggleWeapon.checked) report += (report ? "\n" : "") + "Зброя та б/к - " + (formData.weapon && formData.weapon.trim() ? formData.weapon.trim() : "без змін");
    if (toggleNote.checked && formData.note) report += (report ? "\n" : "") + formData.note.trim();
    return report;
  }

  resultBtn.onclick = () => {
    const text = buildReport();
    previewModalContent.textContent = text || "(порожньо)";
    const imagesEl = document.getElementById("previewModalImages");
    if (imagesEl) imagesEl.innerHTML = "";
    previewModal.classList.add("is-open");
    previewModal.setAttribute("aria-hidden", "false");
  };

  previewModalClose.onclick = () => {
    previewModal.classList.remove("is-open");
    previewModal.setAttribute("aria-hidden", "true");
  };

  previewModal.onclick = (e) => {
    if (e.target === previewModal) {
      previewModal.classList.remove("is-open");
      previewModal.setAttribute("aria-hidden", "true");
    }
  };

  copyBtn.onclick = async () => {
    const text = buildReport();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error("no clipboard");
      }
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.className = "clipboard-helper";
      ta.value = text;
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    alert("Скопiйовано 👍");
  };

  shareBtn.onclick = async () => {
    if (!navigator.share) return;
    const text = buildReport();
    try {
      await navigator.share({ text });
    } catch (err) {
      if (err.name !== "AbortError") throw err;
    }
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initForm);
} else {
  initForm();
}
