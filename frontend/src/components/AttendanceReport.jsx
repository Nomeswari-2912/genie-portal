import React, { useState } from "react";

const months = {
  Sep: {
    name: "September",
    year: 2027,
    month: 8,
    statuses: { 2: "present", 3: "present", 4: "late", 5: "present", 6: "late", 9: "present", 10: "present", 11: "present", 12: "late", 13: "present", 16: "present", 17: "late", 18: "present", 19: "absent", 20: "present", 23: "present", 24: "present", 25: "late", 26: "present", 27: "absent", 30: "present" },
  },
  Oct: {
    name: "October",
    year: 2027,
    month: 9,
    statuses: { 1: "present", 2: "present", 3: "present", 4: "late", 5: "late", 8: "present", 9: "present", 10: "present", 11: "late", 12: "late", 15: "present", 16: "late", 17: "present", 18: "late", 19: "late", 22: "present", 23: "present", 24: "absent", 25: "absent", 28: "present", 29: "late", 30: "absent", 31: "present" },
  },
  Nov: {
    name: "November",
    year: 2027,
    month: 10,
    statuses: { 1: "present", 4: "present", 5: "present", 6: "present", 7: "present", 8: "present", 11: "present", 12: "present", 13: "present", 14: "present", 15: "present", 18: "present", 19: "present", 20: "present", 21: "present", 22: "present", 25: "present", 26: "present", 27: "present", 28: "present", 29: "present" },
  },
  Dec: {
    name: "December",
    year: 2027,
    month: 11,
    statuses: { 2: "present", 3: "present", 4: "late", 5: "present", 6: "present", 9: "present", 10: "present", 11: "present", 12: "late", 13: "present", 16: "present", 17: "present", 18: "present", 19: "absent", 20: "present", 23: "present", 24: "late", 26: "present", 27: "present", 30: "present", 31: "present" },
  },
};

const reports = {
  "oct-nov": {
    label: "01/10/2027 - 30/11/2027",
    monthKeys: ["Oct", "Nov"],
    present: 40,
    absent: 4,
    late: 12,
    rate: 70,
  },
  "nov-dec": {
    label: "01/11/2027 - 31/12/2027",
    monthKeys: ["Nov", "Dec"],
    present: 38,
    absent: 5,
    late: 9,
    rate: 73,
  },
};

const weekdayNames = ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"];
const semesterMonths = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const semesterAttendance = [
  [82, 36, 20], [84, 38, 22], [83, 37, 19], [82, 36, 21], [83, 37, 20],
  [82, 36, 19], [84, 38, 22], [83, 37, 20], [82, 36, 19], [83, 38, 21], [82, 37, 20],
];

function AttendanceCalendar({ monthKey, selectedDate, onSelectDate }) {
  const month = months[monthKey];
  const firstWeekday = (new Date(month.year, month.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <article className="attendance-calendar">
      <h2>{month.name} {month.year}</h2>
      <div className="attendance-calendar-grid" role="grid" aria-label={`${month.name} ${month.year}`}>
        {weekdayNames.map((day) => <span className="attendance-weekday" role="columnheader" key={day}>{day}</span>)}
        {cells.map((day, index) => {
          if (!day) return <span className="attendance-day is-empty" role="gridcell" key={`empty-${index}`} />;
          const status = month.statuses[day];
          const isSelected = selectedDate.month === monthKey && selectedDate.day === day;
          const label = status ? `${month.name} ${day}, ${month.year}: ${status}` : `${month.name} ${day}, ${month.year}`;

          return (
            <span className="attendance-day-cell" role="gridcell" key={day}>
              <button
                type="button"
                className={`attendance-day ${status ? `status-${status}` : ""} ${isSelected ? "is-selected" : ""}`}
                aria-label={label}
                aria-pressed={isSelected}
                onClick={() => onSelectDate({ month: monthKey, day })}
              >
                {day}
                {status && <i aria-hidden="true" />}
              </button>
            </span>
          );
        })}
      </div>
    </article>
  );
}

function SemesterChart() {
  return (
    <div className="semester-chart" role="img" aria-label="Monthly attendance from September through July, showing present, late, and absent days">
      <div className="semester-y-axis"><span>100</span><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
      <div className="semester-plot">
        {[0, 20, 40, 60, 80, 100].map((line) => <span className="semester-gridline" style={{ bottom: `${line}%` }} key={line} />)}
        <div className="semester-groups">
          {semesterMonths.map((month, index) => (
            <div className="semester-month" key={month}>
              <div className="semester-bars">
                <i className="bar-present" style={{ height: `${semesterAttendance[index][0]}%` }} />
                <i className="bar-late" style={{ height: `${semesterAttendance[index][1]}%` }} />
                <i className="bar-absent" style={{ height: `${semesterAttendance[index][2]}%` }} />
              </div>
              <span>{month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AttendanceReport() {
  const [range, setRange] = useState("oct-nov");
  const [selectedDate, setSelectedDate] = useState({ month: "Oct", day: 17 });
  const [showDetails, setShowDetails] = useState(false);
  const report = reports[range];
  const selectedMonth = months[selectedDate.month];

  return (
    <div className="tool-page attendance-page">
      <header className="attendance-header">
        <div>
          <p className="attendance-selected-date">
            {selectedDate.day}<sup>{selectedDate.day % 10 === 1 && selectedDate.day !== 11 ? "st" : selectedDate.day % 10 === 2 && selectedDate.day !== 12 ? "nd" : selectedDate.day % 10 === 3 && selectedDate.day !== 13 ? "rd" : "th"}</sup> {selectedMonth.name} {selectedMonth.year}
          </p>
          <h1>Attendance Record</h1>
          <div className="attendance-legend" aria-label="Attendance status legend">
            <span><i className="legend-present" />Present</span>
            <span><i className="legend-absent" />Absent</span>
            <span><i className="legend-late" />Late</span>
          </div>
        </div>
        <label className="attendance-range">
          <span className="attendance-range-icon" aria-hidden="true">▦</span>
          <select aria-label="Attendance date range" value={range} onChange={(event) => {
            const nextRange = event.target.value;
            setRange(nextRange);
            setSelectedDate({ month: reports[nextRange].monthKeys[0], day: 1 });
          }}>
            <option value="oct-nov">{reports["oct-nov"].label}</option>
            <option value="nov-dec">{reports["nov-dec"].label}</option>
          </select>
          <span aria-hidden="true">⌄</span>
        </label>
      </header>

      <section className="attendance-calendars" aria-label="Monthly attendance calendars">
        {report.monthKeys.map((monthKey) => (
          <AttendanceCalendar key={monthKey} monthKey={monthKey} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        ))}
      </section>

      <section className="attendance-totals" aria-label="Attendance totals">
        <article className="attendance-total total-present"><h2>Total Days Present</h2><strong>{report.present}</strong></article>
        <article className="attendance-total total-absent"><h2>Total Days Absent</h2><strong>{report.absent}</strong></article>
        <article className="attendance-total total-late"><h2>Total Days Late</h2><strong>{report.late}</strong></article>
      </section>

      <section className="attendance-breakdown">
        <div className="attendance-breakdown-heading">
          <h2>Attendance Breakdown</h2>
          <button type="button" onClick={() => setShowDetails((visible) => !visible)} aria-expanded={showDetails}>
            {showDetails ? "Hide Attendance Report" : "View Attendance Report"}
          </button>
        </div>
        <div className="attendance-charts">
          <article className="attendance-chart-card attendance-donut-card">
            <h3>Attendance Overview</h3>
            <div className="attendance-donut" style={{ "--attendance-rate": `${report.rate}%` }}>
              <div><span>Present</span><strong>{report.rate}%</strong></div>
            </div>
          </article>
          <article className="attendance-chart-card semester-card">
            <div className="semester-card-heading">
              <h3>First Semester 2027/2028</h3>
              <div className="attendance-legend chart-legend">
                <span><i className="legend-present" />Present</span>
                <span><i className="legend-absent" />Absent</span>
                <span><i className="legend-late" />Late</span>
              </div>
            </div>
            <SemesterChart />
          </article>
        </div>
        {showDetails && (
          <div className="attendance-detail-table" role="region" aria-label="Attendance report details">
            <div><span>Date range</span><strong>{report.label}</strong></div>
            <div><span>Days present</span><strong>{report.present}</strong></div>
            <div><span>Days absent</span><strong>{report.absent}</strong></div>
            <div><span>Days late</span><strong>{report.late}</strong></div>
          </div>
        )}
      </section>
    </div>
  );
}
