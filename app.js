const state = {
  visibleMonth: startOfMonth(new Date()),
  selectedDate: startOfDay(new Date()),
};

const elements = {
  title: document.querySelector('#calendar-title'),
  subtitle: document.querySelector('#month-subtitle'),
  grid: document.querySelector('#calendar-grid'),
  detailsTitle: document.querySelector('#details-title'),
  selectedLunar: document.querySelector('#selected-lunar'),
  selectedNote: document.querySelector('#selected-note'),
};

// Intl をここへ閉じ込めることで、将来「日本の旧暦」専用ライブラリへ置換しやすくしています。
const lunarFormatter = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Tokyo',
});
const japaneseFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Tokyo',
});

function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function sameDay(left, right) { return left.getTime() === right.getTime(); }
function addDays(date, days) { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; }
function addMonths(date, months) { return new Date(date.getFullYear(), date.getMonth() + months, 1); }

function lunarText(date) {
  const parts = lunarFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
  const month = values.month.replace('月', '月');
  return `${values.relatedYear ?? values.year}年 ${month}${values.day}日`;
}

function lunarShortText(date) {
  const parts = lunarFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
  return values.day === '1' ? values.month : `${values.day}日`;
}

function render() {
  const month = state.visibleMonth;
  elements.title.textContent = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' }).format(month);
  elements.subtitle.textContent = `${lunarText(month).split(' ')[0]} を含む月`;
  elements.grid.replaceChildren();

  const calendarStart = addDays(month, -month.getDay());
  for (let index = 0; index < 42; index += 1) {
    const date = addDays(calendarStart, index);
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'day-cell';
    cell.setAttribute('aria-label', `${japaneseFormatter.format(date)}、旧暦 ${lunarText(date)}`);
    if (date.getMonth() !== month.getMonth()) cell.classList.add('outside');
    if (sameDay(date, startOfDay(new Date()))) cell.classList.add('is-today');
    if (sameDay(date, state.selectedDate)) cell.classList.add('is-selected');
    cell.innerHTML = `<span class="solar-day">${date.getDate()}</span><span class="lunar-day">旧 ${lunarShortText(date)}</span>`;
    cell.addEventListener('click', () => { state.selectedDate = date; state.visibleMonth = startOfMonth(date); render(); });
    elements.grid.append(cell);
  }

  elements.detailsTitle.textContent = japaneseFormatter.format(state.selectedDate);
  elements.selectedLunar.textContent = `旧暦 ${lunarText(state.selectedDate)}`;
  elements.selectedNote.textContent = 'セルを選ぶと、この欄に西暦と旧暦を大きく表示します。';
}

document.querySelector('#previous-month').addEventListener('click', () => { state.visibleMonth = addMonths(state.visibleMonth, -1); render(); });
document.querySelector('#next-month').addEventListener('click', () => { state.visibleMonth = addMonths(state.visibleMonth, 1); render(); });
document.querySelector('#today-button').addEventListener('click', () => { state.visibleMonth = startOfMonth(new Date()); state.selectedDate = startOfDay(new Date()); render(); });

render();
