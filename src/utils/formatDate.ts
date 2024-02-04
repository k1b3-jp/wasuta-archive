const formatDate = (dateString: string): string => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const utcDate = new Date(date.toUTCString());
  const jstDate = new Date(utcDate);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return jstDate.toLocaleDateString('ja-JP', options);
};

export default formatDate;
