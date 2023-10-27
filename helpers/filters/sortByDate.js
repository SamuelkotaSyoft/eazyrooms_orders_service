export default function sortByDate(requestData, filterObj) {
  const lastWeek = new Date();
  const today = new Date();
  const tomorrow = new Date(today);

  //TODO change this to a  function outside this module that will return into filterObj after the demo
  switch (requestData.sortBy) {
    case "thisWeek":
      lastWeek.setDate(lastWeek.getDate() - 7);
      filterObj.updatedAt = { $lte: lastWeek };
      break;
    case "lastWeek":
      lastWeek.setDate(lastWeek.getDate() - 7);
      filterObj.updatedAt = { $gte: lastWeek };
      break;
    case "last30Days":
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      filterObj.updatedAt = { $gte: last30Days };
      break;
    case "today":
      today.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filterObj.updatedAt = { $gte: today, $lt: tomorrow };
      break;
    default:
      today.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filterObj.updatedAt = { $gte: today, $lt: tomorrow };
  }
  console.log(filterObj);
  return filterObj;
}
