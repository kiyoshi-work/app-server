export function generateTagKeyByIdol(idolId: string) {
  return `idol_${idolId}`;
}

export function generateTagKeyByUser(idolId: string) {
  return `user_${idolId}`;
}

export const formatDate = (time?: Date) => {
  // Create a new Date object
  const currentDate = time || new Date();

  // Get the day, month, and year from the Date object
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Note: January is month 0
  const year = currentDate.getFullYear();

  // Pad the day and month with leading zeros if necessary
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  // Create the formatted date string in DD-MM-YYYY format
  const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
  //YYYY-MM-DD
  return formattedDate;
};
