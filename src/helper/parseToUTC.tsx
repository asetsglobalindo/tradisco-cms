const parseToUTC = (currentDate: string) => {
  const now = new Date(currentDate);
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  return utc;
};

export default parseToUTC;

