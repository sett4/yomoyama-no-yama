import { DateTime } from 'luxon';

const formattedDate = (dateObj, format) => {
  return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(format);
};

export default formattedDate;
