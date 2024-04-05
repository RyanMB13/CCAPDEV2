function toggleComments() {
  const div = document.getElementById('commentsContainer');
  if (div.style.display === 'none') {
      div.style.display = 'block';
  } else {
      div.style.display = 'none';
  }
}
