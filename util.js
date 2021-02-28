/**
 * finds the index of the first occurence of a month and a year
 * e.g. it would find the first index that shows Aug 2020 in the CSV file, which is 26
 * @param {List} data reddit data(timestamped_post_count_data.csv)
 * @param {String} month e.g. "Aug"
 * @param {String} year e.g. "2020"
 */
function findFirstIdx(month, year, data) {
  var i;
  for (i = 0; i < data.length; i++) {
    let curr = data[i]._time;
    if (curr.slice(-4) === year && curr.includes(month)) { break; }
  }
  return i;
}

/**
 * parse COVID data based on a selected month and year
 * return format: [caseForDay1, caseForDay2, caseForDay3, ...]
 * @param {String} monthYear month and year string which should be gotten from MONTHS i.e. "Aug 2020"
 * @param {List} data COVID data(COVID_data.csv)
 */
function parseCOVIDData(monthYear, data) {
  //TODO: parse data
  const [month, year] = monthYear.split(" ");
  const daysInMonth = {
    "Jan": 31,
    "Feb": 28, 
    "Mar": 31, 
    "Apr": 30,
    "May": 31,
    "Jun": 30, 
    "Jul": 31,
    "Aug": 31,
    "Sep": 30, 
    "Oct": 31,
    "Nov": 30,
    "Dec": 31
  };

  const firstIdx = findFirstIdx(month, year, data);
  const end = daysInMonth[month];
  let casesList = [];
  if (month === "Jul" && year === "2020") { 
    casesList = Array(6).fill(0);
    end = 25; 
  } // since our data starts from Jul 6th 2020 and that month ends 25 days later
  
  for (let start = 1, idx = firstIdx; idx < data.length && start <= end; start++, idx++) {
    casesList.push(parseInt(data[idx].totalNewCases));
  }
  return casesList;
}

/**
 * parse reddit data
 * return format: [{num: 1}, {num:2}...]
 * @param {String} monthYear month and year string which should be gotten from MONTHS i.e. "Aug 2020"
 * @param {List} data reddit data(timestamped_post_count_data.csv)
 */
function parseRedditData(monthYear, data) {
  // get start index using epoch time
  const [month, year] = monthYear.split(" ");
  // get start epoch time of this month(in seconds)
  const start_epoch = new Date(`${month} 01 ${year}`).getTime() / 1000;
  // find start index in data
  const start_index = data.findIndex((element) => element.epoch > start_epoch);
  //console.log(start_index);

  // push daily data
  let res = [];
  for (
    let cnt = 1, idx = start_index;
    idx < data.length && cnt <= 31;
    cnt++, idx++
  ) {
    let record = data[idx];
    const date_string = new Date(record.epoch * 1000).toDateString();
    if (!date_string.includes(month)) {
      break;
    }
    res.push({ num: parseInt(record.covid_post_count) });
  }
  return res;
}

export { parseCOVIDData, parseRedditData };

