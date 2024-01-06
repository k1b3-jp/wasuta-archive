const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const utcDate = new Date(date.toUTCString());
  const jstDate = new Date(utcDate);

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return jstDate.toLocaleDateString('ja-JP', options);
};

export default formatDate;
