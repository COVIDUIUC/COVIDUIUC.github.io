function parseCOVIDData() {
  //TODO: parse data
  console.log("covid data");
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
  // console.log(start_index);

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
