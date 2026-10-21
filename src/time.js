const DAY = 86400000;
function parseDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('请填写公历日期');
  const [y, m, d] = date.split('-').map(Number);
  if (y < 1900 || y > 2100) throw new Error('首版支持1900—2100年');
  const ms = Date.UTC(y, m - 1, d);
  const parsed = new Date(ms);
  if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d) throw new Error('日期不存在');
  return { y, ms };
}
function parseTime(time) {
  if (!/^\d{2}:\d{2}$/.test(time || '')) throw new Error('时间格式应为HH:mm');
  const [h, m] = time.split(':').map(Number);
  if (h > 23 || m > 59) throw new Error('时间超出范围');
  return h * 60 + m;
}
function requiredNumber(value, label, min, max) {
  if (value === '' || value === null || value === undefined || !Number.isFinite(Number(value))) throw new Error('请填写' + label);
  const n = Number(value);
  if (n < min || n > max) throw new Error(label + '超出范围');
  return n;
}
function periodIndex(minutes) {
  // iztro: 0为00:00—00:59早子，12为23:00—23:59晚子。
  if (minutes >= 1380) return 12;
  return Math.floor((minutes + 60) / 120);
}
function normalizeBirth(input) {
  const { y, ms } = parseDate(input.date);
  const minutes = parseTime(input.time);
  if (!['solar', 'civil'].includes(input.mode)) throw new Error('请选择时间输入方式');
  if (!['男', '女'].includes(input.gender)) throw new Error('请选择排盘性别参数');
  let offset = 0;
  let equation = null;
  let longitude = null;
  let utcOffset = null;
  if (input.mode === 'civil') {
    if (!String(input.place || '').trim()) throw new Error('请填写出生地');
    longitude = requiredNumber(input.longitude, '出生地经度', -180, 180);
    // 用户填写出生当时实际UTC偏移，已包含当时夏令时；不再二次扣夏令时。
    utcOffset = requiredNumber(input.utcOffset, '出生当时UTC偏移', -12, 14);
    if (input.offsetConfirmed !== true) throw new Error('请确认出生当时的时区偏移（含夏令时）');
    const dayOfYear = Math.round((ms - Date.UTC(y, 0, 1)) / DAY) + 1;
    const days = (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / DAY;
    const gamma = 2 * Math.PI / days * (dayOfYear - 1 + (minutes / 60 - 12) / 24);
    equation = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    offset = equation + 4 * longitude - 60 * utcOffset;
  }
  const corrected = new Date(ms + Math.round((minutes + offset) * 60000));
  const date = corrected.toISOString().slice(0, 10);
  parseDate(date);
  const solarMinutes = corrected.getUTCHours() * 60 + corrected.getUTCMinutes() + corrected.getUTCSeconds() / 60;
  const time = corrected.toISOString().slice(11, 19);
  const boundaryDistance = Math.min(solarMinutes % 120 >= 60 ? solarMinutes % 120 - 60 : 60 - solarMinutes % 120, Math.min(solarMinutes, 1440 - solarMinutes));
  const warnings = [];
  if (date !== input.date) warnings.push('校正后跨日，请核对校正后的日期。');
  if (boundaryDistance < 10) warnings.push('距离时辰边界或午夜不足10分钟；首版使用近似换算，出生记录误差可能改变命盘，请先核对。');
  return { date, time, timeIndex: periodIndex(solarMinutes), gender: input.gender, offsetMinutes: Math.round(offset * 100) / 100, equationMinutes: equation === null ? null : Math.round(equation * 100) / 100, longitude, utcOffset, mode: input.mode, warnings, method: input.mode === 'civil' ? 'NOAA均时差近似公式；手动确认历史UTC偏移' : '用户提供真太阳时；未重复校正', rules: 'iztro默认四化/亮度；早晚子分开；闰月fixLeap=true' };
}
export { normalizeBirth, parseDate, parseTime, periodIndex };
