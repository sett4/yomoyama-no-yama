import { DateTime } from 'luxon';

const formattedDate = (dateObj, format) => {
  return DateTime.fromJSDate(new Date(dateObj), { zone: 'utc' }).toFormat(
    format
  );
};

export default formattedDate;
