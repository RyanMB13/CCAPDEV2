document.addEventListener("DOMContentLoaded", function () {
  const likeBtns = document.querySelectorAll('.like-btn');
  const dislikeBtns = document.querySelectorAll('.dislike-btn');

  likeBtns.forEach(likeBtn => {
    likeBtn.addEventListener('click', async function () {
      const eventId = this.dataset.eventId;
      try {
        const response = await fetch(`/likeEvent/${eventId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to like event');
        }
        const data = await response.json();
        const likeCount = this.querySelector('.like-count');
        likeCount.textContent = data.likes;
      } catch (error) {
        console.error('Error liking event:', error);
      }
    });
  });

  dislikeBtns.forEach(dislikeBtn => {
    dislikeBtn.addEventListener('click', async function () {
      const eventId = this.dataset.eventId;
      try {
        const response = await fetch(`/dislikeEvent/${eventId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to dislike event');
        }
        const data = await response.json();
        const dislikeCount = this.querySelector('.dislike-count');
        dislikeCount.textContent = data.dislikes;
      } catch (error) {
        console.error('Error disliking event:', error);
      }
    });
  });

  const deleteEventBtn = document.querySelector('.delete-event-btn');

  deleteEventBtn.addEventListener('click', async function () {
    const eventId = this.dataset.eventId;
    try {
      const response = await fetch(`/deleteEvent/${eventId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      window.location.href = '/events'; 
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  });
});
