export const convertDateToUnixTimestamp = () =>
  Math.floor(new Date().getTime() / 1000);
